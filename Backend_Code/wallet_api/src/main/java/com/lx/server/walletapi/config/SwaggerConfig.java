package com.lx.server.walletapi.config;

import static com.google.common.collect.Lists.newArrayList;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.context.annotation.Configuration;

import springfox.documentation.builders.ApiInfoBuilder;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.service.ApiInfo;
import springfox.documentation.service.ApiKey;
import springfox.documentation.service.AuthorizationScope;
import springfox.documentation.service.SecurityReference;
import springfox.documentation.service.SecurityScheme;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spi.service.contexts.SecurityContext;
import springfox.documentation.spring.web.plugins.Docket;
import springfox.documentation.swagger2.annotations.EnableSwagger2;


//  http://localhost:8080/swagger-ui.html#/

@Configuration
@EnableSwagger2
@ComponentScan("com.lx.server.walletapi.controller")
public class SwaggerConfig {
	
	
	@Value("${config.debug}")
    private Boolean debug; 

	// swagger2的配置文件，这里可以配置swagger2的一些基本的内容，比如扫描的包等等
	@Bean
    public Docket createRestApi() {
		 return new Docket(DocumentationType.SWAGGER_2)
				 	.enable(debug)
	                .select()
	                .apis(RequestHandlerSelectors.basePackage("com.lx.server.walletapi.controller"))
	                .paths(PathSelectors.any())
//	                .paths(PathSelectors.regex("^(?!//user//).*$"))
	                .build()
	                .pathMapping("/")
	                .apiInfo(apiInfo())
	                .securitySchemes(newArrayList(apiKey()))
	                .securityContexts(securityContexts())
	                ;
    }
	@Bean
	SecurityScheme apiKey() {
        return new ApiKey("authorization", "authorization", "Header");
    }
	private List<SecurityContext> securityContexts() {
	        return newArrayList(
	                SecurityContext.builder()
	                        .securityReferences(defaultAuth())
//	                        .forPaths(PathSelectors.regex("^(?!//user//).*$"))
	                        .build()
	        );
	 }
	 
	private List<SecurityReference> defaultAuth() {
	        AuthorizationScope authorizationScope = new AuthorizationScope("global", "accessEverything");
	        AuthorizationScope[] authorizationScopes = new AuthorizationScope[1];
	        authorizationScopes[0] = authorizationScope;
	        return newArrayList(new SecurityReference("authorization", authorizationScopes));
	    }
	// 构建 api文档的详细信息函数,注意这里的注解引用的是哪个
	private ApiInfo apiInfo() {
        return new ApiInfoBuilder()
        		.title("接口文档")
                .description("接口文档可直接执行，点击按钮 Try it 即可</br>需要令牌的接口点击界面左上角的Authorization按钮，填入Bearer +【token】"
                		+ "</br>Bearer ef8c6d919538a26f4065989597a652aa")
                .version("2.0")
                .build();
    }
}