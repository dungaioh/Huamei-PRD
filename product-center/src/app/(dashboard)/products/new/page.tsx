import { redirect } from "next/navigation";
import { createProduct } from "@/actions/products";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function NewProductPage() {
  async function action(formData: FormData) {
    "use server";
    await createProduct(formData);
    redirect("/products");
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-xl font-semibold text-neutral-900 mb-6">新建产品</h1>
      <form action={action} className="space-y-4 bg-white rounded-xl border border-neutral-200 p-6">
        <div className="space-y-1.5">
          <Label htmlFor="name">产品名称 *</Label>
          <Input id="name" name="name" required placeholder="输入产品名称" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category">产品分类</Label>
          <Input id="category" name="category" placeholder="例：电子产品、服装、食品" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="description">需求描述</Label>
          <Textarea id="description" name="description" rows={4} placeholder="描述产品需求或背景" />
        </div>
        <div className="flex gap-3">
          <Button type="submit">创建产品</Button>
          <Button type="button" variant="outline" onClick={() => history.back()}>取消</Button>
        </div>
      </form>
    </div>
  );
}
