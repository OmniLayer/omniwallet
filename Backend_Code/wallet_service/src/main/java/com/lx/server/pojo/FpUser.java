package com.lx.server.pojo;

import java.util.Date;

import com.lx.server.pojo.AbstractObject;

/**
 * 【flashPay 快速支付的用户】持久化对象 数据库表：t_fp_user
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-06-14 10:53:56
 *
 */
public class FpUser extends AbstractObject {

    public static final long serialVersionUID = 1L;

    // id
    private Integer id;
    // t_user_client 的id
    private String userId;
    // hyper的注册邮箱
    private String hpyerUsername;
    // 创建时间
    private Date createTime;

    /** 获取 id 属性 */
    public Integer getId() {
        return id;
    }

    /** 设置 id 属性 */
    public void setId(Integer id) {
        this.id = id;
    }

    /** 获取 t_user_client 的id 属性 */
    public String getUserId() {
        return userId;
    }

    /** 设置 t_user_client 的id 属性 */
    public void setUserId(String userId) {
        this.userId = userId;
    }

    /** 获取 hyper的注册邮箱 属性 */
    public String getHpyerUsername() {
        return hpyerUsername;
    }

    /** 设置 hyper的注册邮箱 属性 */
    public void setHpyerUsername(String hpyerUsername) {
        this.hpyerUsername = hpyerUsername;
    }

    /** 获取 创建时间 属性 */
    public Date getCreateTime() {
        return createTime;
    }

    /** 设置 创建时间 属性 */
    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder();
        sb.append("FpUser");
        sb.append("{id=").append(id);
        sb.append(", userId=").append(userId);
        sb.append(", hpyerUsername=").append(hpyerUsername);
        sb.append(", createTime=").append(createTime);
        sb.append('}');
        return sb.toString();
    }

    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj instanceof FpUser) {
            FpUser fpUser = (FpUser) obj;
            if (this.getId().equals(fpUser.getId())) {
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
