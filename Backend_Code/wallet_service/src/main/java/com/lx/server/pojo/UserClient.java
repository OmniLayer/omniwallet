package com.lx.server.pojo;

import java.util.Date;

/**
 * 【钱包客户端用户】持久化对象 数据库表：t_user_client
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-04-13 23:59:45
 *
 */
public class UserClient extends AbstractObject {

    public static final long serialVersionUID = 1L;

    // id
    private String id;
    // 昵称
    private String nickname;
    // 头像
    private String faceUrl;
    // pin密码
    private String password;
    // 谷歌认证code
    private String googleAuthCode;
    // 启动谷歌认证
    private Boolean googleAuthEnable;
    // 创建时间
    private Date createTime;
    // 上次登录时间
    private Date lastLoginTime;
    // 公钥
    private String publicKey;
    
    public String getPublicKey() {
		return publicKey;
	}

	public void setPublicKey(String publicKey) {
		this.publicKey = publicKey;
	}

	/** 获取 id 属性 */
    public String getId() {
        return id;
    }

    /** 设置 id 属性 */
    public void setId(String id) {
        this.id = id;
    }
    
    public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	/** 获取 昵称 属性 */
    public String getNickname() {
        return nickname;
    }

    /** 设置 昵称 属性 */
    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    /** 获取 头像 属性 */
    public String getFaceUrl() {
        return faceUrl;
    }

    /** 设置 头像 属性 */
    public void setFaceUrl(String faceUrl) {
        this.faceUrl = faceUrl;
    }

    /** 获取 谷歌认证code 属性 */
    public String getGoogleAuthCode() {
        return googleAuthCode;
    }

    /** 设置 谷歌认证code 属性 */
    public void setGoogleAuthCode(String googleAuthCode) {
        this.googleAuthCode = googleAuthCode;
    }

    /** 获取 启动谷歌认证 属性 */
    public Boolean getGoogleAuthEnable() {
        return googleAuthEnable;
    }

    /** 设置 启动谷歌认证 属性 */
    public void setGoogleAuthEnable(Boolean googleAuthEnable) {
        this.googleAuthEnable = googleAuthEnable;
    }

    /** 获取 创建时间 属性 */
    public Date getCreateTime() {
        return createTime;
    }

    /** 设置 创建时间 属性 */
    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    /** 获取 上次登录时间 属性 */
    public Date getLastLoginTime() {
        return lastLoginTime;
    }

    /** 设置 上次登录时间 属性 */
    public void setLastLoginTime(Date lastLoginTime) {
        this.lastLoginTime = lastLoginTime;
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder();
        sb.append("UserClient");
        sb.append("{id=").append(id);
        sb.append(", nickname=").append(nickname);
        sb.append(", faceUrl=").append(faceUrl);
        sb.append(", googleAuthCode=").append(googleAuthCode);
        sb.append(", googleAuthEnable=").append(googleAuthEnable);
        sb.append(", createTime=").append(createTime);
        sb.append(", lastLoginTime=").append(lastLoginTime);
        sb.append('}');
        return sb.toString();
    }

    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj instanceof UserClient) {
            UserClient userClient = (UserClient) obj;
            if (this.getId().equals(userClient.getId())) {
                return true;
            }
        }
        return false;
    }

    public int hashCode() {
        String pkStr = "" + this.getId();
        return pkStr.hashCode();
    }

}
