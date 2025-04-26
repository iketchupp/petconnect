package org.petconnect.backend.repository;

import java.util.List;
import java.util.UUID;

import org.petconnect.backend.model.Message;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {

        // Find all messages between two users that have a pet
        @Query("SELECT m FROM Message m WHERE " +
                        "((m.senderId = :userId AND m.receiverId = :otherId) OR " +
                        "(m.senderId = :otherId AND m.receiverId = :userId)) " +
                        "AND m.petId IS NOT NULL " +
                        "ORDER BY m.sentAt ASC")
        List<Message> findConversation(@Param("userId") UUID userId, @Param("otherId") UUID otherId);

        // Find all messages between two users about a specific pet
        @Query("SELECT m FROM Message m WHERE " +
                        "((m.senderId = :userId AND m.receiverId = :otherId) OR " +
                        "(m.senderId = :otherId AND m.receiverId = :userId)) " +
                        "AND m.petId = :petId " +
                        "ORDER BY m.sentAt ASC")
        List<Message> findConversationAboutPet(@Param("userId") UUID userId, @Param("otherId") UUID otherId,
                        @Param("petId") UUID petId);

        // Find all conversations for a user (returns the latest message for each
        // distinct conversation)
        @Query(nativeQuery = true, value = "SELECT * FROM message m1 WHERE m1.sent_at = " +
                        "(SELECT MAX(m2.sent_at) FROM message m2 WHERE " +
                        "((m2.sender_id = m1.sender_id AND m2.receiver_id = m1.receiver_id) OR " +
                        "(m2.sender_id = m1.receiver_id AND m2.receiver_id = m1.sender_id)) " +
                        "AND m2.pet_id = m1.pet_id) " +
                        "AND (m1.sender_id = :userId OR m1.receiver_id = :userId) " +
                        "AND m1.pet_id IS NOT NULL " +
                        "ORDER BY m1.sent_at DESC")
        List<Message> findUserConversations(@Param("userId") UUID userId);

        // Find unread messages count for a user
        @Query("SELECT COUNT(m) FROM Message m WHERE m.receiverId = :userId AND m.isRead = false AND m.petId IS NOT NULL")
        long countUnreadMessages(@Param("userId") UUID userId);

        // Find all conversations with unread messages for a user
        @Query(nativeQuery = true, value = "SELECT * FROM message m1 WHERE m1.sent_at = " +
                        "(SELECT MAX(m2.sent_at) FROM message m2 WHERE " +
                        "((m2.sender_id = m1.sender_id AND m2.receiver_id = m1.receiver_id) OR " +
                        "(m2.sender_id = m1.receiver_id AND m2.receiver_id = m1.sender_id)) " +
                        "AND m2.pet_id = m1.pet_id) " +
                        "AND (m1.sender_id = :userId OR m1.receiver_id = :userId) " +
                        "AND m1.pet_id IS NOT NULL " +
                        "AND EXISTS (SELECT 1 FROM message m3 WHERE m3.receiver_id = :userId " +
                        "AND m3.is_read = false AND ((m3.sender_id = m1.sender_id AND m3.receiver_id = m1.receiver_id) OR "
                        +
                        "(m3.sender_id = m1.receiver_id AND m3.receiver_id = m1.sender_id)) " +
                        "AND m3.pet_id = m1.pet_id) " +
                        "ORDER BY m1.sent_at DESC")
        List<Message> findUnreadConversations(@Param("userId") UUID userId);

        // Update messages as read in a conversation
        @Modifying
        @Transactional
        @Query("UPDATE Message m SET m.isRead = true WHERE m.receiverId = :userId AND m.senderId = :otherId AND m.isRead = false AND m.petId IS NOT NULL")
        void markConversationAsRead(@Param("userId") UUID userId, @Param("otherId") UUID otherId);

        // Update messages as read in a conversation about a specific pet
        @Modifying
        @Transactional
        @Query("UPDATE Message m SET m.isRead = true WHERE m.receiverId = :userId AND m.senderId = :otherId AND m.petId = :petId AND m.isRead = false")
        void markConversationAboutPetAsRead(@Param("userId") UUID userId, @Param("otherId") UUID otherId,
                        @Param("petId") UUID petId);
}