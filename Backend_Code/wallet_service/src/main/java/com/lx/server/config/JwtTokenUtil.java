package com.lx.server.config;

import java.io.Serializable;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

import org.springframework.stereotype.Component;

import com.lx.server.pojo.UserAdmin;
import com.lx.server.pojo.UserClient;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;

@Component
public class JwtTokenUtil implements Serializable {

	private static final long serialVersionUID = -3301605591108950415L;

	private static final String CLAIM_KEY_USERNAME = "sub";
	public static final String CLAIM_KEY_CREATED = "created";
	public static final String LastLoginTime = "lastLoginTime";

	public Integer getUserIdFromToken(String token) {
		Integer id;
		try {
			final Claims claims = getClaimsFromToken(token);
			if (claims == null) {
				if (claims == null) {
					throw new Exception("无效令牌，请重新登录");
				}
			}
			id = (Integer) claims.get("userId");
		} catch (Exception e) {
			id = null;
		}
		return id;
	}
	
	public String getClientUserIdFromToken(String token) {
		String id;
		try {
			final Claims claims = getClaimsFromToken(token);
			if (claims == null) {
				if (claims == null) {
					throw new Exception("无效令牌，请重新登录");
				}
			}
			id = (String) claims.get("userId");
		} catch (Exception e) {
			id = null;
		}
		return id;
	}

	public String getUsernameFromToken(String token) {
		String username;
		try {
			final Claims claims = getClaimsFromToken(token);
			if (claims == null) {
				if (claims == null) {
					throw new CustomAuthException("无效令牌，请重新登录");
				}
			}
			username = claims.getSubject();
		} catch (Exception e) {
			username = null;
		}
		return username;
	}

	public Date getCreatedDateFromToken(String token) {
		Date created;
		try {
			final Claims claims = getClaimsFromToken(token);
			created = new Date((Long) claims.get(CLAIM_KEY_CREATED));
		} catch (Exception e) {
			created = null;
		}
		return created;
	}

	public Date getExpirationDateFromToken(String token) {
		Date expiration;
		try {
			final Claims claims = getClaimsFromToken(token);
			expiration = claims.getExpiration();
		} catch (Exception e) {
			expiration = null;
		}
		return expiration;
	}

	public Claims getClaimsFromToken(String token) {
		Claims claims;
		try {
			claims = Jwts.parser().setSigningKey(GlobalConfig.secret).parseClaimsJws(token).getBody();
		} catch (Exception e) {
			claims = null;
		}
		return claims;
	}

	private Date generateExpirationDate() {
		return new Date(System.currentTimeMillis() + GlobalConfig.expiration * 1000);
	}

	public Boolean isTokenExpired(String token) throws JwtException {
		final Date expiration = getExpirationDateFromToken(token);
		return expiration.before(new Date());
	}

	private Boolean isCreatedBeforeLastPasswordReset(Date created, Date lastPasswordReset) {
		return (lastPasswordReset != null && created.before(lastPasswordReset));
	}

	public String generateToken(UserAdmin userDetails, Map<String, Object> claims) {
		if (claims == null) {
			claims = new HashMap<>();
		}
		claims.put(CLAIM_KEY_USERNAME, userDetails.getUsername());
		claims.put(CLAIM_KEY_CREATED, new Date());
		claims.put("exp",generateExpirationDate());
		return generateToken(claims);
	}
	
	public String generateClientToken(UserClient userDetails, Map<String, Object> claims) {
		if (claims == null) {
			claims = new HashMap<>();
		}
		claims.put(CLAIM_KEY_USERNAME, userDetails.getNickname());
		claims.put(CLAIM_KEY_CREATED, new Date());
		claims.put("exp",generateExpirationDate());
		return generateToken(claims);
	}

	public String generateToken(Map<String, Object> claims) {
		return Jwts.builder().setClaims(claims).setExpiration(generateExpirationDate()).signWith(SignatureAlgorithm.HS256, GlobalConfig.secret).compact();
	}

	public String refreshToken(String token) {
		String refreshedToken;
		try {
			final Claims claims = getClaimsFromToken(token);
			claims.put(CLAIM_KEY_CREATED, new Date());
			refreshedToken = generateToken(claims);
		} catch (Exception e) {
			refreshedToken = null;
		}
		return refreshedToken;
	}
	
	public Date getLastLoginTimeFromToken(String token) {
		Date created;
		try {
			final Claims claims = getClaimsFromToken(token);
			created = new Date((Long) claims.get(LastLoginTime));
		} catch (Exception e) {
			created = null;
		}
		return created;
	}

	public Boolean validateToken(String token, UserAdmin user) {
		final String username = getUsernameFromToken(token);
		final Date created = getCreatedDateFromToken(token);
		final Date lastLoginTime = getLastLoginTimeFromToken(token);
		return (lastLoginTime.equals(user.getLastLoginTime())
				&&username.equals(user.getUsername())
				&&!isTokenExpired(token)
				&&!isCreatedBeforeLastPasswordReset(created, user.getLastPasswordResetDate())
				);
	}
	public Boolean validateClientToken(String token, UserClient user) {
		final Date lastLoginTime = getLastLoginTimeFromToken(token);
		return (lastLoginTime.equals(user.getLastLoginTime())
//				&& username.equals(user.getNickname())
//				&&!isTokenExpired(token)
				);
	}
}
