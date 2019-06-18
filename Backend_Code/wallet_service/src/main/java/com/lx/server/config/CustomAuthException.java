package com.lx.server.config;

import org.springframework.security.core.AuthenticationException;

public class CustomAuthException extends AuthenticationException {

    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;
	
	public CustomAuthException(String message){
        super(message);
    }
    public CustomAuthException(String msg, Throwable t) {
        super(msg, t);
    }
}
