package com.lx.server.pojo;

import java.util.Date;

/**
 * 【用户的转账常用地址】持久化对象 数据库表：t_user_transfer_address
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-04-22 09:12:07
 *
 */
public class UserTransferAddress extends AbstractObject {

    public static final long serialVersionUID = 1L;

    // 
    private Integer id;
    // 用户id t_user_client
    private String userId;
    // 地址名称
    private String nickname;
    // 常用地址
    private String address;
    // 备注
    private String note;
    // 创建时间
    private Date createTime;

    /** 获取  属性 */
    public Integer getId() {
        return id;
    }

    /** 设置  属性 */
    public void setId(Integer id) {
        this.id = id;
    }

    /** 获取 用户id t_user_client 属性 */
    public String getUserId() {
        return userId;
    }

    /** 设置 用户id t_user_client 属性 */
    public void setUserId(String userId) {
        this.userId = userId;
    }

    /** 获取 地址名称 属性 */
    public String getNickname() {
        return nickname;
    }

    /** 设置 地址名称 属性 */
    public void setNickname(String nickname) {
        this.nickname = nickname;
    }

    /** 获取 常用地址 属性 */
    public String getAddress() {
        return address;
    }

    /** 设置 常用地址 属性 */
    public void setAddress(String address) {
        this.address = address;
    }

    /** 获取 备注 属性 */
    public String getNote() {
        return note;
    }

    /** 设置 备注 属性 */
    public void setNote(String note) {
        this.note = note;
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
        sb.append("UserTransferAddress");
        sb.append("{id=").append(id);
        sb.append(", userId=").append(userId);
        sb.append(", nickname=").append(nickname);
        sb.append(", address=").append(address);
        sb.append(", note=").append(note);
        sb.append(", createTime=").append(createTime);
        sb.append('}');
        return sb.toString();
    }

    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj instanceof UserTransferAddress) {
            UserTransferAddress userTransferAddress = (UserTransferAddress) obj;
            if (this.getId().equals(userTransferAddress.getId())) {
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
