package tracker.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;

@Document(collection = "transactions")
@Data
public class Transaction {
    @Id
    private String id;
    private String description;
    private BigDecimal amount;
    private String type; // INCOME or EXPENSE
    private String category;
    private LocalDate date;
    private String userId; // Maps to the User's document ID
}