package com.lx.server.pojo;

import java.util.Date;

import com.lx.server.pojo.AbstractObject;

/**
 * 【平台默认创建资产列表】持久化对象 数据库表：t_default_asset
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-05-15 22:30:09
 *
 */
public class DefaultAsset extends AbstractObject {

    public static final long serialVersionUID = 1L;

    // 
    private Integer id;
    // 推广资产id
    private Integer assetId;
    // 资产名称
    private String assetName;
    // 图标
    private String imageUrl;
    // 
    private Date createTime;
    // 
    private Integer createBy;
    // 序号
    private Integer sortOrder;
    // 备注
    private String note;

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

    /** 获取 图标 属性 */
    public String getImageUrl() {
        return imageUrl;
    }

    /** 设置 图标 属性 */
    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
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

    /** 获取 备注 属性 */
    public String getNote() {
        return note;
    }

    /** 设置 备注 属性 */
    public void setNote(String note) {
        this.note = note;
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder();
        sb.append("DefaultAsset");
        sb.append("{id=").append(id);
        sb.append(", assetId=").append(assetId);
        sb.append(", assetName=").append(assetName);
        sb.append(", imageUrl=").append(imageUrl);
        sb.append(", createTime=").append(createTime);
        sb.append(", createBy=").append(createBy);
        sb.append(", sortOrder=").append(sortOrder);
        sb.append(", note=").append(note);
        sb.append('}');
        return sb.toString();
    }

    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj instanceof DefaultAsset) {
            DefaultAsset defaultAsset = (DefaultAsset) obj;
            if (this.getId().equals(defaultAsset.getId())) {
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
