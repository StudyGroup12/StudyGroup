package com.studygroup.domain.board.service;

import com.studygroup.domain.auth.entity.Member;
import com.studygroup.domain.auth.repository.MemberRepository;
import com.studygroup.domain.board.dto.BoardDetailResponse;
import com.studygroup.domain.board.dto.BoardSummaryResponse;
import com.studygroup.domain.board.dto.CreateBoardRequest;
import com.studygroup.domain.board.dto.LikeResponse;
import com.studygroup.domain.board.dto.UpdateBoardRequest;
import com.studygroup.domain.board.entity.Board;
import com.studygroup.domain.board.entity.BoardLike;
import com.studygroup.domain.board.repository.BoardCountProjection;
import com.studygroup.domain.board.repository.BoardLikeRepository;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BoardService {

    private final BoardRepository boardRepository;
    private final CommentRepository commentRepository;
    private final BoardLikeRepository boardLikeRepository;
    private final MembershipRepository membershipRepository;
    private final StudyGroupRepository studyGroupRepository;
    private final MemberRepository memberRepository;

    @Transactional
    public BoardDetailResponse createBoard(Long groupId, CreateBoardRequest request, Long memberId) {
        validateMember(groupId, memberId);

        Board board = Board.builder()
                .groupId(groupId)
                .authorId(memberId)
                .title(request.getTitle())
                .content(request.getContent())
                .build();
        Board saved = boardRepository.save(board);

        return BoardDetailResponse.of(saved, getNickname(memberId), 0L, 0L, false);
    }

    public Page<BoardSummaryResponse> getBoards(Long groupId, Long memberId, Pageable pageable) {
        validateMember(groupId, memberId);

        Page<Board> boards = boardRepository.findByGroupId(groupId, pageable);
        List<Long> boardIds = boards.getContent().stream().map(Board::getId).toList();

        Map<Long, String> nicknames = getNicknames(
                boards.getContent().stream().map(Board::getAuthorId).distinct().toList());
        Map<Long, Long> likeCounts = toCountMap(boardLikeRepository.countByBoardIdIn(boardIds));
        Map<Long, Long> commentCounts = toCountMap(commentRepository.countByBoardIdIn(boardIds));

        return boards.map(board -> BoardSummaryResponse.of(
                board,
                nicknames.getOrDefault(board.getAuthorId(), "알 수 없음"),
                likeCounts.getOrDefault(board.getId(), 0L),
                commentCounts.getOrDefault(board.getId(), 0L)
        ));
    }

    public BoardDetailResponse getBoard(Long groupId, Long boardId, Long memberId) {
        validateMember(groupId, memberId);
        Board board = getBoard(boardId, groupId);

        long likeCount = boardLikeRepository.countByBoardId(boardId);
        long commentCount = commentRepository.findByBoardIdOrderByCreatedAtAsc(boardId).size();
        boolean likedByMe = boardLikeRepository.existsByBoardIdAndMemberId(boardId, memberId);

        return BoardDetailResponse.of(board, getNickname(board.getAuthorId()), likeCount, commentCount, likedByMe);
    }

    @Transactional
    public BoardDetailResponse updateBoard(Long groupId, Long boardId, UpdateBoardRequest request, Long memberId) {
        validateMember(groupId, memberId);
        Board board = getBoard(boardId, groupId);

        if (!board.isAuthor(memberId)) {
            throw new CustomException(ErrorCode.NOT_BOARD_AUTHOR);
        }

        board.update(request.getTitle(), request.getContent());

        long likeCount = boardLikeRepository.countByBoardId(boardId);
        long commentCount = commentRepository.findByBoardIdOrderByCreatedAtAsc(boardId).size();
        boolean likedByMe = boardLikeRepository.existsByBoardIdAndMemberId(boardId, memberId);

        return BoardDetailResponse.of(board, getNickname(board.getAuthorId()), likeCount, commentCount, likedByMe);
    }

    @Transactional
    public void deleteBoard(Long groupId, Long boardId, Long memberId) {
        validateMember(groupId, memberId);
        Board board = getBoard(boardId, groupId);

        StudyGroup group = studyGroupRepository.findById(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_NOT_FOUND));

        // 작성자 본인 또는 그룹 방장만 삭제 가능
        if (!board.isAuthor(memberId) && !group.isOwnedBy(memberId)) {
            throw new CustomException(ErrorCode.NOT_BOARD_AUTHOR);
        }

        commentRepository.deleteByBoardId(boardId);
        boardLikeRepository.deleteByBoardId(boardId);
        boardRepository.delete(board);
    }

    @Transactional
    public LikeResponse toggleLike(Long groupId, Long boardId, Long memberId) {
        validateMember(groupId, memberId);
        getBoard(boardId, groupId);

        boolean likedByMe = boardLikeRepository.findByBoardIdAndMemberId(boardId, memberId)
                .map(like -> {
                    boardLikeRepository.delete(like);
                    return false;
                })
                .orElseGet(() -> {
                    boardLikeRepository.save(BoardLike.builder()
                            .boardId(boardId)
                            .memberId(memberId)
                            .build());
                    return true;
                });

        return new LikeResponse(likedByMe, boardLikeRepository.countByBoardId(boardId));
    }

    private Board getBoard(Long boardId, Long groupId) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new CustomException(ErrorCode.BOARD_NOT_FOUND));
        // 다른 그룹의 게시글을 URL 조작으로 접근하는 것을 차단
        if (!board.getGroupId().equals(groupId)) {
            throw new CustomException(ErrorCode.BOARD_NOT_FOUND);
        }
        return board;
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

    private Map<Long, Long> toCountMap(List<BoardCountProjection> projections) {
        return projections.stream()
                .collect(Collectors.toMap(BoardCountProjection::getBoardId, BoardCountProjection::getCount));
    }
}
