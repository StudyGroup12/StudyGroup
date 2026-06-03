package com.studygroup.domain.board.service;

import com.studygroup.domain.auth.entity.Member;
import com.studygroup.domain.auth.repository.MemberRepository;
import com.studygroup.domain.board.dto.CommentResponse;
import com.studygroup.domain.board.dto.CreateCommentRequest;
import com.studygroup.domain.board.entity.Board;
import com.studygroup.domain.board.entity.Comment;
import com.studygroup.domain.board.repository.BoardRepository;
import com.studygroup.domain.board.repository.CommentRepository;
import com.studygroup.domain.group.entity.StudyGroup;
import com.studygroup.domain.group.repository.StudyGroupRepository;
import com.studygroup.domain.membership.entity.Membership;
import com.studygroup.domain.membership.entity.MembershipStatus;
import com.studygroup.domain.membership.repository.MembershipRepository;
import com.studygroup.global.exception.CustomException;
import com.studygroup.global.response.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class CommentService {

    private final CommentRepository commentRepository;
    private final BoardRepository boardRepository;
    private final MembershipRepository membershipRepository;
    private final StudyGroupRepository studyGroupRepository;
    private final MemberRepository memberRepository;

    @Transactional
    public CommentResponse createComment(Long groupId, Long boardId, CreateCommentRequest request, Long memberId) {
        validateMember(groupId, memberId);
        validateBoard(boardId, groupId);

        Comment comment = Comment.builder()
                .boardId(boardId)
                .authorId(memberId)
                .content(request.getContent())
                .build();
        Comment saved = commentRepository.save(comment);

        return CommentResponse.of(saved, getNickname(memberId));
    }

    public List<CommentResponse> getComments(Long groupId, Long boardId, Long memberId) {
        validateMember(groupId, memberId);
        validateBoard(boardId, groupId);

        List<Comment> comments = commentRepository.findByBoardIdOrderByCreatedAtAsc(boardId);
        Map<Long, String> nicknames = getNicknames(
                comments.stream().map(Comment::getAuthorId).distinct().toList());

        return comments.stream()
                .map(comment -> CommentResponse.of(
                        comment, nicknames.getOrDefault(comment.getAuthorId(), "알 수 없음")))
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteComment(Long groupId, Long boardId, Long commentId, Long memberId) {
        validateMember(groupId, memberId);
        validateBoard(boardId, groupId);

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new CustomException(ErrorCode.COMMENT_NOT_FOUND));
        if (!comment.getBoardId().equals(boardId)) {
            throw new CustomException(ErrorCode.COMMENT_NOT_FOUND);
        }

        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_NOT_FOUND));

        // 작성자 본인 또는 그룹 방장만 삭제 가능
        if (!comment.isAuthor(memberId) && !group.isOwnedBy(memberId)) {
            throw new CustomException(ErrorCode.NOT_COMMENT_AUTHOR);
        }

        commentRepository.delete(comment);
    }

    private void validateBoard(Long boardId, Long groupId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new CustomException(ErrorCode.BOARD_NOT_FOUND));
        if (!board.getGroupId().equals(groupId)) {
            throw new CustomException(ErrorCode.BOARD_NOT_FOUND);
        }
    }

    private void validateMember(Long groupId, Long memberId) {
        Membership membership = membershipRepository.findByGroupIdAndMemberId(groupId, memberId)
                .orElseThrow(() -> new CustomException(ErrorCode.NOT_MEMBER));
        if (membership.getStatus() != MembershipStatus.ACCEPTED) {
            throw new CustomException(ErrorCode.NOT_MEMBER);
        }
    }

    private String getNickname(Long memberId) {
        return memberRepository.findById(memberId)
                .map(Member::getNickname)
                .orElse("알 수 없음");
    }

    private Map<Long, String> getNicknames(List<Long> memberIds) {
        return memberRepository.findAllById(memberIds).stream()
                .collect(Collectors.toMap(Member::getId, Member::getNickname));
    }
}
