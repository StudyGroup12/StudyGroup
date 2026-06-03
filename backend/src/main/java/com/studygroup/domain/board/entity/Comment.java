package com.studygroup.domain.board.entity;

import com.studygroup.global.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Entity
@Table(name = "comments")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Comment extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long boardId;

    @Column(nullable = false)
    private Long authorId;

    @Column(nullable = false, length = 1000)
    private String content;

    @Builder
    public Comment(Long boardId, Long authorId, String content) {
        this.boardId = boardId;
        this.authorId = authorId;
        this.content = content;
    }

    public boolean isAuthor(Long memberId) {
        return this.authorId.equals(memberId);
    }
}
