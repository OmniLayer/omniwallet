package com.lx.server.walletapi.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;

import com.lx.server.config.GlobalConfig;


@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true)
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

	
	@Value("${jwt.secret}")
    String secret;
    @Value("${jwt.tokenHead}")
    String tokenHead;
    @Value("${jwt.header}")
    String header;
    @Value("${jwt.expiration}")
    long expiration;
    
    @Value("${site.upload.path}")
    String uploadPath;
    
	
	@Override
    public void configure(WebSecurity webSecurity) {
		webSecurity.ignoring().antMatchers(
                "/api/**",
                "/v2/api-docs",
                "/swagger-resources/**",
                "/swagger-ui.html",
                "/webjars/**"
        );
    }
	
	@Override
    protected void configure(HttpSecurity httpSecurity) throws Exception {
        //region 设置JWT过滤器
        httpSecurity
        		.csrf().disable()
    			.sessionManagement()
    			.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeRequests()
                .antMatchers(HttpMethod.OPTIONS).permitAll()
                .anyRequest()
                .authenticated()
                ;
        httpSecurity.headers().cacheControl();
        
        GlobalConfig.expiration = expiration;
        GlobalConfig.secret = secret;
        GlobalConfig.BASE_IMAGE_ADDRESS = uploadPath;
    }
}
