package com.lx.server.pojo;

import java.util.Date;

import com.lx.server.pojo.AbstractObject;

/**
 * 【App版本号管理】持久化对象 数据库表：t_app_version
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-05-15 11:27:21
 *
 */
public class AppVersion extends AbstractObject {

    public static final long serialVersionUID = 1L;

    // ID
    private Integer id;
    // 版本平台:0:ios  1:android 
    private Byte platform;
    // 版本号名称：1.0.1
    private String name;
    // 内部版本号
    private Integer code;
    // 是否强制更新
    private Boolean isForce;
    // 文件下载路径
    private String path;
    // 版本说明
    private String note;
    // 版本说明英文
    private String noteEn;
    // 上传时间
    private Date createTime;
    // 上传用户
    private Integer createBy;

    /** 获取 ID 属性 */
    public Integer getId() {
        return id;
    }

    /** 设置 ID 属性 */
    public void setId(Integer id) {
        this.id = id;
    }

    /** 获取 版本平台:0:ios  1:android  属性 */
    public Byte getPlatform() {
        return platform;
    }

    /** 设置 版本平台:0:ios  1:android  属性 */
    public void setPlatform(Byte platform) {
        this.platform = platform;
    }

    /** 获取 版本号名称：1.0.1 属性 */
    public String getName() {
        return name;
    }

    /** 设置 版本号名称：1.0.1 属性 */
    public void setName(String name) {
        this.name = name;
    }

    /** 获取 内部版本号 属性 */
    public Integer getCode() {
        return code;
    }

    /** 设置 内部版本号 属性 */
    public void setCode(Integer code) {
        this.code = code;
    }

    /** 获取 是否强制更新 属性 */
    public Boolean getIsForce() {
        return isForce;
    }

    /** 设置 是否强制更新 属性 */
    public void setIsForce(Boolean isForce) {
        this.isForce = isForce;
    }

    /** 获取 文件下载路径 属性 */
    public String getPath() {
        return path;
    }

    /** 设置 文件下载路径 属性 */
    public void setPath(String path) {
        this.path = path;
    }

    /** 获取 版本说明 属性 */
    public String getNote() {
        return note;
    }

    /** 设置 版本说明 属性 */
    public void setNote(String note) {
        this.note = note;
    }

    /** 获取 版本说明英文 属性 */
    public String getNoteEn() {
        return noteEn;
    }

    /** 设置 版本说明英文 属性 */
    public void setNoteEn(String noteEn) {
        this.noteEn = noteEn;
    }

    /** 获取 上传时间 属性 */
    public Date getCreateTime() {
        return createTime;
    }

    /** 设置 上传时间 属性 */
    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    /** 获取 上传用户 属性 */
    public Integer getCreateBy() {
        return createBy;
    }

    /** 设置 上传用户 属性 */
    public void setCreateBy(Integer createBy) {
        this.createBy = createBy;
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder();
        sb.append("AppVersion");
        sb.append("{id=").append(id);
        sb.append(", platform=").append(platform);
        sb.append(", name=").append(name);
        sb.append(", code=").append(code);
        sb.append(", isForce=").append(isForce);
        sb.append(", path=").append(path);
        sb.append(", note=").append(note);
        sb.append(", noteEn=").append(noteEn);
        sb.append(", createTime=").append(createTime);
        sb.append(", createBy=").append(createBy);
        sb.append('}');
        return sb.toString();
    }

    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj instanceof AppVersion) {
            AppVersion appVersion = (AppVersion) obj;
            if (this.getId().equals(appVersion.getId())) {
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
