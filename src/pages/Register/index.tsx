import React, { useState } from "react";
import { Input, Button, CardBody, Card } from "@heroui/react";
import { Form } from "antd"; // Use antd Card instead

const Register: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      console.log("Registration values:", values);
    } catch (error) {
      console.error("Registration failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetSmsCode = async () => {
    try {
      const phone = form.getFieldValue("username");
      if (!phone) return;
      console.log("Sending SMS to:", phone);
    } catch (error) {
      console.error("SMS sending failed:", error);
    }
  };

  const handleRefreshCaptcha = () => {
    console.log("Refreshing captcha");
  };

  return (
    <div className="max-w-sm mx-auto">
      <Card>
        <CardBody>
          <h2>注册账号</h2>
          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
            autoComplete="off"
          >
            <Form.Item
              name="username"
              label="用户名"
              rules={[{ required: true, message: "请输入用户名" }]}
            >
              <Input fullWidth placeholder="请输入用户名" size="lg" />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: "请输入密码" }]}
            >
              <Input
                type="password"
                fullWidth
                placeholder="请输入密码"
                size="lg"
              />
            </Form.Item>

            <Form.Item
              name="captcha"
              label="图形验证码"
              rules={[{ required: true, message: "请输入图形验证码" }]}
            >
              <div className="flex gap-2">
                <Input
                  placeholder="请输入图形验证码"
                  size="lg"
                  className="flex-grow"
                />
                <div onClick={handleRefreshCaptcha}>验证码图片</div>
              </div>
            </Form.Item>

            <Form.Item
              name="smsCode"
              label="短信验证码"
              rules={[{ required: true, message: "请输入短信验证码" }]}
            >
              <div className="flex gap-2">
                <Input
                  placeholder="请输入短信验证码"
                  size="lg"
                  className="flex-grow"
                />
                <Button onPress={handleGetSmsCode}>获取验证码</Button>
              </div>
            </Form.Item>

            <Form.Item>
              <Button
                color="primary"
                type="submit"
                isLoading={loading}
                fullWidth
              >
                注册
              </Button>
            </Form.Item>
          </Form>
        </CardBody>
      </Card>
    </div>
  );
};

export default Register;
