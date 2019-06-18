package com.lx.server.pojo;

import java.util.Date;

import com.lx.server.pojo.AbstractObject;

/**
 * 【用户钱包地址的资产】持久化对象 数据库表：t_wallet_asset
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-04-28 10:00:16
 *
 */
public class WalletAsset extends AbstractObject {

    public static final long serialVersionUID = 1L;

    // id
    private Integer id;
    // 钱包地址
    private String address;
    // 支持类型 0 btc币，1omni资产
    private Byte assetType;
    // 对应的omni的支持id
    private Integer assetId;
    // 资产名称
    private String assetName;
    // 创建时间
    private Date createTime;
    // t_user_client id
    private String userId;
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

    /** 获取 钱包地址 属性 */
    public String getAddress() {
        return address;
    }

    /** 设置 钱包地址 属性 */
    public void setAddress(String address) {
        this.address = address;
    }

    /** 获取 支持类型 0 btc币，1omni资产 属性 */
    public Byte getAssetType() {
        return assetType;
    }

    /** 设置 支持类型 0 btc币，1omni资产 属性 */
    public void setAssetType(Byte assetType) {
        this.assetType = assetType;
    }

    /** 获取 对应的omni的支持id 属性 */
    public Integer getAssetId() {
        return assetId;
    }

    /** 设置 对应的omni的支持id 属性 */
    public void setAssetId(Integer assetId) {
        this.assetId = assetId;
    }

    /** 获取 资产名称 属性 */
    public String getAssetName() {
        return assetName;
    }

    /** 设置 资产名称 属性 */
    public void setAssetName(String assetName) {
        this.assetName = assetName;
    }

    /** 获取 创建时间 属性 */
    public Date getCreateTime() {
        return createTime;
    }

    /** 设置 创建时间 属性 */
    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    /** 获取 t_user_client id 属性 */
    public String getUserId() {
        return userId;
    }

    /** 设置 t_user_client id 属性 */
    public void setUserId(String userId) {
        this.userId = userId;
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
        sb.append("WalletAsset");
        sb.append("{id=").append(id);
        sb.append(", address=").append(address);
        sb.append(", assetType=").append(assetType);
        sb.append(", assetId=").append(assetId);
        sb.append(", assetName=").append(assetName);
        sb.append(", createTime=").append(createTime);
        sb.append(", userId=").append(userId);
        sb.append(", visible=").append(visible);
        sb.append('}');
        return sb.toString();
    }

    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj instanceof WalletAsset) {
            WalletAsset walletAsset = (WalletAsset) obj;
            if (this.getId().equals(walletAsset.getId())) {
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
