package tracker.controller;

import tracker.model.Transaction;
import tracker.model.User;
import tracker.repository.TransactionRepository;
import tracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/transactions")
@CrossOrigin(origins = "http://localhost:3000")
public class TransactionController {

    @Autowired private TransactionRepository transactionRepository;
    @Autowired private UserRepository userRepository;

    private User getAuthenticatedUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping
    public List<Transaction> getAll() {
        return transactionRepository.findByUserId(getAuthenticatedUser().getId());
    }

    @PostMapping
    public Transaction create(@RequestBody Transaction transaction) {
        transaction.setUserId(getAuthenticatedUser().getId());
        return transactionRepository.save(transaction);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Transaction> update(@PathVariable String id, @RequestBody Transaction details) {
        Transaction tx = transactionRepository.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        if (!tx.getUserId().equals(getAuthenticatedUser().getId())) {
            return ResponseEntity.status(403).build();
        }
        tx.setDescription(details.getDescription());
        tx.setAmount(details.getAmount());
        tx.setType(details.getType());
        tx.setCategory(details.getCategory());
        tx.setDate(details.getDate());
        return ResponseEntity.ok(transactionRepository.save(tx));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        Transaction tx = transactionRepository.findById(id).orElseThrow(() -> new RuntimeException("Not found"));
        if (!tx.getUserId().equals(getAuthenticatedUser().getId())) {
            return ResponseEntity.status(403).build();
        }
        transactionRepository.delete(tx);
        return ResponseEntity.ok().build();
    }
}