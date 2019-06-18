package com.lx.server.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class CustomPasswordEncoder implements PasswordEncoder {

    @Value("${jwt.secret}")
    String secret;

    public CustomPasswordEncoder() {
    	
    }

    @Override
    public String encode(CharSequence rawPassword) {
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(8);
        return passwordEncoder.encode(rawPassword + secret);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder(8);
        return passwordEncoder.matches(rawPassword.toString() + secret, encodedPassword);
    }
}
