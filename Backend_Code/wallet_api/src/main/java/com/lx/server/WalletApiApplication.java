package com.lx.server;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@MapperScan({"com.lx.server.dao"})
@SpringBootApplication
@EnableScheduling 
public class WalletApiApplication {
	public static void main(String[] args) {
		SpringApplication.run(WalletApiApplication.class, args);
	}
}
