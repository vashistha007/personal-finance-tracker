package tracker.config;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;

@Configuration
public class MongoConfig {

    @Bean
    public MongoClient mongoClient() {
        // Direct local connection setting
        return MongoClients.create("mongodb://localhost:27017");
    }

    @Bean
    public MongoTemplate mongoTemplate() {
        // Yahan humne database ka naam hardcode kar diya hai!
        // Ab Spring Boot har haal mein isi naam ka database banayega.
        return new MongoTemplate(mongoClient(), "finance_tracker");
    }
}