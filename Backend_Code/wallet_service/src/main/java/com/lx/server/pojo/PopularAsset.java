package com.lx.server.pojo;

import java.util.Date;

import com.lx.server.pojo.AbstractObject;

/**
 * 【平台推广资产列表】持久化对象 数据库表：t_popular_asset
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-05-13 10:57:30
 *
 */
public class PopularAsset extends AbstractObject {

    public static final long serialVersionUID = 1L;

    // 
    private Integer id;
    // 推广资产id
    private Integer assetId;
    // 资产名称
    private String assetName;
    // 
    private Date createTime;
    // 
    private Integer createBy;
    // 序号
    private Integer sortOrder;

    /** 获取  属性 */
    public Integer getId() {
        return id;
    }

    /** 设置  属性 */
    public void setId(Integer id) {
        this.id = id;
    }

    /** 获取 推广资产id 属性 */
    public Integer getAssetId() {
        return assetId;
    }

    /** 设置 推广资产id 属性 */
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

    /** 获取  属性 */
    public Date getCreateTime() {
        return createTime;
    }

    /** 设置  属性 */
    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    /** 获取  属性 */
    public Integer getCreateBy() {
        return createBy;
    }

    /** 设置  属性 */
    public void setCreateBy(Integer createBy) {
        this.createBy = createBy;
    }

    /** 获取 序号 属性 */
    public Integer getSortOrder() {
        return sortOrder;
    }

    /** 设置 序号 属性 */
    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder();
        sb.append("PopularAsset");
        sb.append("{id=").append(id);
        sb.append(", assetId=").append(assetId);
        sb.append(", assetName=").append(assetName);
        sb.append(", createTime=").append(createTime);
        sb.append(", createBy=").append(createBy);
        sb.append(", sortOrder=").append(sortOrder);
        sb.append('}');
        return sb.toString();
    }

    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj instanceof PopularAsset) {
            PopularAsset popularAsset = (PopularAsset) obj;
            if (this.getId().equals(popularAsset.getId())) {
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
