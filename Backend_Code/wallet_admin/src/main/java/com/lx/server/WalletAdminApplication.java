package com.lx.server;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@MapperScan({"com.lx.server.dao"})
@SpringBootApplication
public class WalletAdminApplication {
	public static void main(String[] args) {
		SpringApplication.run(WalletAdminApplication.class, args);
	}
}
