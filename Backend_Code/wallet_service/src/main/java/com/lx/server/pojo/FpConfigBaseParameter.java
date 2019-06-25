package com.lx.server.pojo;

import java.util.Date;

import com.lx.server.pojo.AbstractObject;

/**
 * 【平台基本配置参数】持久化对象 数据库表：t_fp_config_base_parameter
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-06-14 10:53:53
 *
 */
public class FpConfigBaseParameter extends AbstractObject {

    public static final long serialVersionUID = 1L;

    // id
    private Integer id;
    // 配置参数名称
    private String typeName;
    // 参数值
    private Integer paramValue;
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

    /** 获取 配置参数名称 属性 */
    public String getTypeName() {
        return typeName;
    }

    /** 设置 配置参数名称 属性 */
    public void setTypeName(String typeName) {
        this.typeName = typeName;
    }

    /** 获取 参数值 属性 */
    public Integer getParamValue() {
        return paramValue;
    }

    /** 设置 参数值 属性 */
    public void setParamValue(Integer paramValue) {
        this.paramValue = paramValue;
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
        sb.append("FpConfigBaseParameter");
        sb.append("{id=").append(id);
        sb.append(", typeName=").append(typeName);
        sb.append(", paramValue=").append(paramValue);
        sb.append(", createTime=").append(createTime);
        sb.append(", createBy=").append(createBy);
        sb.append('}');
        return sb.toString();
    }

    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj instanceof FpConfigBaseParameter) {
            FpConfigBaseParameter fpConfigBaseParameter = (FpConfigBaseParameter) obj;
            if (this.getId().equals(fpConfigBaseParameter.getId())) {
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
