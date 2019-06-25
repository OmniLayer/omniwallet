package com.lx.server.pojo;

import java.util.Date;

import com.lx.server.pojo.AbstractObject;

/**
 * 【用户反馈】持久化对象 数据库表：t_user_feedback
 *
 * @author AutoCode 309444359@qq.com
 * @date 2019-05-14 10:11:44
 *
 */
public class UserFeedback extends AbstractObject {

    public static final long serialVersionUID = 1L;

    // id
    private Integer id;
    // t_user_client的id
    private String userId;
    // 标题
    private String title;
    // 文字描述
    private String content;
    // 图片地址
    private String imageUrls;
    // 邮箱
    private String email;
    // 创建时间
    private Date createTime;
    // 后台处理人员
    private Integer dealBy;
    // 处理意见
    private String dealResult;
    // 处理时间
    private Date dealTime;
    // 0 创建待处理，1 已处理待查看，2 用户已查看
    private Byte state;

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

    /** 获取 标题 属性 */
    public String getTitle() {
        return title;
    }

    /** 设置 标题 属性 */
    public void setTitle(String title) {
        this.title = title;
    }

    /** 获取 文字描述 属性 */
    public String getContent() {
        return content;
    }

    /** 设置 文字描述 属性 */
    public void setContent(String content) {
        this.content = content;
    }

    /** 获取 图片地址 属性 */
    public String getImageUrls() {
        return imageUrls;
    }

    /** 设置 图片地址 属性 */
    public void setImageUrls(String imageUrls) {
        this.imageUrls = imageUrls;
    }

    /** 获取 邮箱 属性 */
    public String getEmail() {
        return email;
    }

    /** 设置 邮箱 属性 */
    public void setEmail(String email) {
        this.email = email;
    }

    /** 获取 创建时间 属性 */
    public Date getCreateTime() {
        return createTime;
    }

    /** 设置 创建时间 属性 */
    public void setCreateTime(Date createTime) {
        this.createTime = createTime;
    }

    /** 获取 后台处理人员 属性 */
    public Integer getDealBy() {
        return dealBy;
    }

    /** 设置 后台处理人员 属性 */
    public void setDealBy(Integer dealBy) {
        this.dealBy = dealBy;
    }

    /** 获取 处理意见 属性 */
    public String getDealResult() {
        return dealResult;
    }

    /** 设置 处理意见 属性 */
    public void setDealResult(String dealResult) {
        this.dealResult = dealResult;
    }

    /** 获取 处理时间 属性 */
    public Date getDealTime() {
        return dealTime;
    }

    /** 设置 处理时间 属性 */
    public void setDealTime(Date dealTime) {
        this.dealTime = dealTime;
    }

    /** 获取 0 创建待处理，1 已处理待查看，2 用户已查看 属性 */
    public Byte getState() {
        return state;
    }

    /** 设置 0 创建待处理，1 已处理待查看，2 用户已查看 属性 */
    public void setState(Byte state) {
        this.state = state;
    }

    @Override
    public String toString() {
        final StringBuilder sb = new StringBuilder();
        sb.append("UserFeedback");
        sb.append("{id=").append(id);
        sb.append(", userId=").append(userId);
        sb.append(", title=").append(title);
        sb.append(", content=").append(content);
        sb.append(", imageUrls=").append(imageUrls);
        sb.append(", email=").append(email);
        sb.append(", createTime=").append(createTime);
        sb.append(", dealBy=").append(dealBy);
        sb.append(", dealResult=").append(dealResult);
        sb.append(", dealTime=").append(dealTime);
        sb.append(", state=").append(state);
        sb.append('}');
        return sb.toString();
    }

    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj instanceof UserFeedback) {
            UserFeedback userFeedback = (UserFeedback) obj;
            if (this.getId().equals(userFeedback.getId())) {
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
