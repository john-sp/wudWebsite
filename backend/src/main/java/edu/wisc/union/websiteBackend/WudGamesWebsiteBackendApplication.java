package edu.wisc.union.websiteBackend;

import lombok.Data;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;


@SpringBootApplication(scanBasePackages = "edu.wisc.union.websiteBackend")
@EnableJpaRepositories(basePackages = "edu.wisc.union.websiteBackend.jpa")
@EntityScan(basePackages = "edu.wisc.union.websiteBackend")
public class WudGamesWebsiteBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(WudGamesWebsiteBackendApplication.class, args);
	}


}

