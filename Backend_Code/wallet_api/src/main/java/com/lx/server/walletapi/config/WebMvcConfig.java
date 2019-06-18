package com.lx.server.walletapi.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.web.ResourceProperties;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurationSupport;

import com.lx.server.WalletApiApplication;

@Configuration
@ComponentScan(basePackageClasses = WalletApiApplication.class, useDefaultFilters = true)
public class WebMvcConfig extends WebMvcConfigurationSupport {

	
	@Autowired
	private GlobalJwtInterceptor globalJwtInterceptor;
	
	
	@Autowired
	private InputDataInterceptor inputDataInterceptor;

	@Override
	protected void addInterceptors(InterceptorRegistry registry) {
		registry.addInterceptor(inputDataInterceptor)
		.addPathPatterns("/api/**")
		.excludePathPatterns("/api/common/uploadImage")
		.excludePathPatterns("/api/user/updateUserFace")
		;
		registry
		.addInterceptor(globalJwtInterceptor)
		.addPathPatterns("/api/**")
		.excludePathPatterns("/api/common/**")
		;
		super.addInterceptors(registry);
	}

	@Override
	protected void addResourceHandlers(ResourceHandlerRegistry registry) {
		registry.addResourceHandler("swagger-ui.html").addResourceLocations("classpath:/META-INF/resources/");
		registry.addResourceHandler("/webjars/**").addResourceLocations("classpath:/META-INF/resources/webjars/");
		new ResourceProperties.Strategy().getContent().setPaths(new String[]{"/**"});
		super.addResourceHandlers(registry);
	}


}
