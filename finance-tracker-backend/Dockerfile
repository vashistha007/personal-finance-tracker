# Step 1: Build the Maven application
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .

# Fix: Grant execution permission to mvnw wrapper script
RUN chmod +x ./mvnw

# Build the app skipping unit tests
RUN ./mvnw clean package -DskipTests

# Step 2: Run the application
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]