package net.javaguides.springboot.model;

import jakarta.persistence.*;

@Entity
@Table(name = "requests")
public class Request {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @Column(name = "item_id")
    private long itemId;

    @Column(name = "recipient_id")
    private long recipientId;

    @Column(name = "status")
    private String status;

    public Request() {}

    public Request(long itemId, long recipientId, String status) {
        this.itemId = itemId;
        this.recipientId = recipientId;
        this.status = status;
    }

    public long getId() { return id; }
    public void setId(long id) { this.id = id; }
    public long getItemId() { return itemId; }
    public void setItemId(long itemId) { this.itemId = itemId; }
    public long getRecipientId() { return recipientId; }
    public void setRecipientId(long recipientId) { this.recipientId = recipientId; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}