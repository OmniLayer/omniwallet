package com.lx.server.pojo;

import java.util.Date;

import com.lx.server.pojo.AbstractObject;

/**
 * 【用户钱包地址】持久化对象 数据库表：t_wallet_address
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-04-28 09:36:25
 *
 */
public class WalletAddress extends AbstractObject {

    public static final long serialVersionUID = 1L;

    // id
    private Integer id;
    // t_user_client的id
    private String userId;
    // 钱包地址
    private String address;
    // 钱包索引
    private Integer addressIndex;
    // 钱包名称
    private String addressName;
    // 是否启用
    private Boolean isEnable;
    // 创建时间
    private Date createTime;
    // 是否可见
    private Boolean visible;

    /** 获取 id 属性 */
    public Integer getId() {
        return id;
    }

    /** 设置 id 属性 */
    public void setId(Integer id) {
        this.id = id;
    }

    /** 获取 t_user_client的id 属性 */
    public String getUserId() {
        return userId;
    }

    /** 设置 t_user_client的id 属性 */
    public void setUserId(String userId) {
        this.userId = userId;
    }

    /** 获取 钱包地址 属性 */
    public String getAddress() {
        return address;
    }

    /** 设置 钱包地址 属性 */
    public void setAddress(String address) {
        this.address = address;
    }

    /** 获取 钱包索引 属性 */
    public Integer getAddressIndex() {
        return addressIndex;
    }

    /** 设置 钱包索引 属性 */
    public void setAddressIndex(Integer addressIndex) {
        this.addressIndex = addressIndex;
    }

    /** 获取 钱包名称 属性 */
    public String getAddressName() {
        return addressName;
    }

    /** 设置 钱包名称 属性 */
    public void setAddressName(String addressName) {
        this.addressName = addressName;
    }

    /** 获取 是否启用 属性 */
    public Boolean getIsEnable() {
        return isEnable;
    }

    /** 设置 是否启用 属性 */
    public void setIsEnable(Boolean isEnable) {
        this.isEnable = isEnable;
    }

    /** 获取 创建时间 属性 */
    public Date getCreateTime() {
        return createTime;
    }

    /** 设置 创建时间 属性 */
    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    /** 获取 是否可见 属性 */
    public Boolean getVisible() {
        return visible;
    }

    /** 设置 是否可见 属性 */
    public void setVisible(Boolean visible) {
        this.visible = visible;
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder();
        sb.append("WalletAddress");
        sb.append("{id=").append(id);
        sb.append(", userId=").append(userId);
        sb.append(", address=").append(address);
        sb.append(", addressIndex=").append(addressIndex);
        sb.append(", addressName=").append(addressName);
        sb.append(", isEnable=").append(isEnable);
        sb.append(", createTime=").append(createTime);
        sb.append(", visible=").append(visible);
        sb.append('}');
        return sb.toString();
    }

    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj instanceof WalletAddress) {
            WalletAddress walletAddress = (WalletAddress) obj;
            if (this.getId().equals(walletAddress.getId())) {
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
