package com.lx.server.pojo;

import java.util.Date;

import com.lx.server.pojo.AbstractObject;

/**
 * 【用户表】持久化对象 数据库表：t_user_admin
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-04-26 17:42:20
 *
 */
public class UserAdmin extends AbstractObject {

    public static final long serialVersionUID = 1L;

    // id
    private Integer id;
    // 登录账号
    private String username;
    // 密码
    private String password;
    // 昵称
    private String nickname;
    // 头像
    private String faceUrl;
    // 最近一次登录时间
    private Date lastLoginTime;
    // 是否启用
    private Boolean isEnable;
    // 是否删除
    private Boolean isDelete;
    // 创建时间
    private Date createTime;
    // 上一次修改密码的时间
    private Date lastPasswordResetDate;

    /** 获取 id 属性 */
    public Integer getId() {
        return id;
    }

    /** 设置 id 属性 */
    public void setId(Integer id) {
        this.id = id;
    }

    /** 获取 登录账号 属性 */
    public String getUsername() {
        return username;
    }

    /** 设置 登录账号 属性 */
    public void setUsername(String username) {
        this.username = username;
    }

    /** 获取 密码 属性 */
    public String getPassword() {
        return password;
    }

    /** 设置 密码 属性 */
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

    /** 获取 最近一次登录时间 属性 */
    public Date getLastLoginTime() {
        return lastLoginTime;
    }

    /** 设置 最近一次登录时间 属性 */
    public void setLastLoginTime(Date lastLoginTime) {
        this.lastLoginTime = lastLoginTime;
    }

    /** 获取 是否启用 属性 */
    public Boolean getIsEnable() {
        return isEnable;
    }

    /** 设置 是否启用 属性 */
    public void setIsEnable(Boolean isEnable) {
        this.isEnable = isEnable;
    }

    /** 获取 是否删除 属性 */
    public Boolean getIsDelete() {
        return isDelete;
    }

    /** 设置 是否删除 属性 */
    public void setIsDelete(Boolean isDelete) {
        this.isDelete = isDelete;
    }

    /** 获取 创建时间 属性 */
    public Date getCreateTime() {
        return createTime;
    }

    /** 设置 创建时间 属性 */
    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    /** 获取 上一次修改密码的时间 属性 */
    public Date getLastPasswordResetDate() {
        return lastPasswordResetDate;
    }

    /** 设置 上一次修改密码的时间 属性 */
    public void setLastPasswordResetDate(Date lastPasswordResetDate) {
        this.lastPasswordResetDate = lastPasswordResetDate;
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder();
        sb.append("UserAdmin");
        sb.append("{id=").append(id);
        sb.append(", username=").append(username);
        sb.append(", password=").append(password);
        sb.append(", nickname=").append(nickname);
        sb.append(", faceUrl=").append(faceUrl);
        sb.append(", lastLoginTime=").append(lastLoginTime);
        sb.append(", isEnable=").append(isEnable);
        sb.append(", isDelete=").append(isDelete);
        sb.append(", createTime=").append(createTime);
        sb.append(", lastPasswordResetDate=").append(lastPasswordResetDate);
        sb.append('}');
        return sb.toString();
    }

    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj instanceof UserAdmin) {
            UserAdmin userAdmin = (UserAdmin) obj;
            if (this.getId().equals(userAdmin.getId())) {
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
