package com.lx.server.pojo;

import java.util.Date;

import com.lx.server.pojo.AbstractObject;

/**
 * 【平台支持的资产类型】持久化对象 数据库表：t_fp_config_property
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-06-14 10:53:55
 *
 */
public class FpConfigProperty extends AbstractObject {

    public static final long serialVersionUID = 1L;

    // id
    private Integer id;
    // 支持的币种
    private String name;
    // omni的资产id btc为0 usdt为31 lx为361
    private Long propertyId;
    // 描述
    private String desc;
    // 创建时间
    private Date createTime;
    // 创建人
    private Integer createBy;

    /** 获取 id 属性 */
    public Integer getId() {
        return id;
    }

    /** 设置 id 属性 */
    public void setId(Integer id) {
        this.id = id;
    }

    /** 获取 支持的币种 属性 */
    public String getName() {
        return name;
    }

    /** 设置 支持的币种 属性 */
    public void setName(String name) {
        this.name = name;
    }

    /** 获取 omni的资产id btc为0 usdt为31 lx为361 属性 */
    public Long getPropertyId() {
        return propertyId;
    }

    /** 设置 omni的资产id btc为0 usdt为31 lx为361 属性 */
    public void setPropertyId(Long propertyId) {
        this.propertyId = propertyId;
    }

    /** 获取 描述 属性 */
    public String getDesc() {
        return desc;
    }

    /** 设置 描述 属性 */
    public void setDesc(String desc) {
        this.desc = desc;
    }

    /** 获取 创建时间 属性 */
    public Date getCreateTime() {
        return createTime;
    }

    /** 设置 创建时间 属性 */
    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    /** 获取 创建人 属性 */
    public Integer getCreateBy() {
        return createBy;
    }

    /** 设置 创建人 属性 */
    public void setCreateBy(Integer createBy) {
        this.createBy = createBy;
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder();
        sb.append("FpConfigProperty");
        sb.append("{id=").append(id);
        sb.append(", name=").append(name);
        sb.append(", propertyId=").append(propertyId);
        sb.append(", desc=").append(desc);
        sb.append(", createTime=").append(createTime);
        sb.append(", createBy=").append(createBy);
        sb.append('}');
        return sb.toString();
    }

    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj instanceof FpConfigProperty) {
            FpConfigProperty fpConfigProperty = (FpConfigProperty) obj;
            if (this.getId().equals(fpConfigProperty.getId())) {
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
