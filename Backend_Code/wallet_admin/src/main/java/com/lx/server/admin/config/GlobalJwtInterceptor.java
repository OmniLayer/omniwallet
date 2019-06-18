package com.lx.server.admin.config;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import com.lx.server.config.CustomAuthException;
import com.lx.server.config.JwtTokenUtil;
import com.lx.server.pojo.UserAdmin;
import com.lx.server.service.UserAdminService;

import io.jsonwebtoken.Claims;

@Component
public class GlobalJwtInterceptor extends HandlerInterceptorAdapter {
	
	/** Logger available to subclasses */
	protected final Log logger = LogFactory.getLog(getClass());
	
	@Value("${jwt.header}")
	private String tokenHeader;
	
	@Value("${jwt.tokenHead}")
	private String tokenHead;
	
	@Autowired
	private JwtTokenUtil jwtTokenUtil;
	
	@Autowired
	UserAdminService userService;
	
	
	@Autowired
    private SimpleHandlerExceptionResolver resolver;
	
	@Override
	public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
		String oldToken = request.getHeader(tokenHeader);
		String authHeader = request.getHeader(this.tokenHeader);
		logger.info("requestURL： "+request.getRequestURL());
		
		if ("OPTIONS".equals(request.getMethod())) {
			response.setStatus(HttpServletResponse.SC_OK);
			return super.preHandle(request, response, handler);
		}else{
			if (authHeader != null && authHeader.startsWith(tokenHead)) {
				final String token = oldToken.substring(tokenHead.length());
				
				Integer userId = jwtTokenUtil.getUserIdFromToken(token);
				if (userId==null) {
					this.resolver.resolveException(request, response, 1, new CustomAuthException("用户认证失效，请重新登录"));
					return false;
				}
				
				UserAdmin user = userService.selectObject(userId);
				
				if (user==null||user.getIsEnable()==false) {
					this.resolver.resolveException(request, response, 1, new CustomAuthException("用户认证失效，请重新登录"));
					return false;
				}
				if (jwtTokenUtil.validateToken(token, user)==false) {
					this.resolver.resolveException(request, response, 1, new CustomAuthException("用户认证失效，请重新登录"));
					return false;
				}
				
				Claims claims = jwtTokenUtil.getClaimsFromToken(token);
				request.setAttribute("claims", claims);
				request.setAttribute("user", user);
				
				return super.preHandle(request, response, handler);
			} else {
				super.preHandle(request, response, handler);
				this.resolver.resolveException(request, response, 1, new CustomAuthException("用户无效，请重新登录"));
				return false;
			}
		}
	}
}
