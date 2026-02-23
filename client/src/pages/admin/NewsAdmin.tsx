import AdminLayout from "@/components/AdminLayout";
import { adminNewsApi, NewsItem, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { Plus, Pencil, Trash2, Calendar, Image as ImageIcon, Newspaper, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

type NewsCategory = "お知らせ" | "重要なお知らせ" | "プレスリリース" | "メディア掲載";

interface NewsFormData {
  title: string;
  body: string;
  category: NewsCategory;
  eyecatch_image_url: string;
  is_published: boolean;
}

const categories: NewsCategory[] = ["お知らせ", "重要なお知らせ", "プレスリリース", "メディア掲載"];

export default function NewsAdmin() {
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [formData, setFormData] = useState<NewsFormData>({
    title: "",
    body: "",
    category: "お知らせ",
    eyecatch_image_url: "",
    is_published: false,
  });

  // Fetch news list
  const fetchNews = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await adminNewsApi.list();
      setNewsList(data);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "データの取得に失敗しました";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);

  const resetForm = () => {
    setFormData({ title: "", body: "", category: "お知らせ", eyecatch_image_url: "", is_published: false });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (news: NewsItem) => {
    setFormData({
      title: news.title,
      body: news.body,
      category: news.category as NewsCategory,
      eyecatch_image_url: news.eyecatch_image_url || "",
      is_published: news.is_published,
    });
    setEditingId(news.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (editingId) {
        await adminNewsApi.update(editingId, {
          title: formData.title,
          body: formData.body,
          category: formData.category,
          eyecatch_image_url: formData.eyecatch_image_url || undefined,
          is_published: formData.is_published,
        });
        toast.success("NEWSを更新しました");
      } else {
        await adminNewsApi.create({
          title: formData.title,
          body: formData.body,
          category: formData.category,
          eyecatch_image_url: formData.eyecatch_image_url || undefined,
          is_published: formData.is_published,
        });
        toast.success("NEWSを作成しました");
      }
      resetForm();
      fetchNews();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "保存に失敗しました";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    setIsDeleting(id);
    try {
      await adminNewsApi.delete(id);
      toast.success("NEWSを削除しました");
      fetchNews();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "削除に失敗しました";
      toast.error(message);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleTogglePublish = async (news: NewsItem) => {
    try {
      await adminNewsApi.togglePublish(news.id, !news.is_published);
      toast.success(news.is_published ? "非公開にしました" : "公開しました");
      fetchNews();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "更新に失敗しました";
      toast.error(message);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold text-white">NEWS管理</h1>
            <p className="text-gray-400 mt-2">お知らせ・プレスリリースの投稿・編集</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={(open) => { if (!open) resetForm(); setIsDialogOpen(open); }}>
            <DialogTrigger asChild>
              <Button className="bg-brass text-anthracite hover:bg-brass-light">
                <Plus size={20} className="mr-2" />
                新規作成
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-anthracite border-white/10 max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-white font-display text-xl">
                  {editingId ? "NEWS編集" : "NEWS新規作成"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">タイトル</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="タイトルを入力"
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">種別</label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: NewsCategory) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-anthracite border-white/10">
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat} className="text-white hover:bg-white/10">
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Image URL */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">アイキャッチ画像URL（任意）</label>
                  <Input
                    value={formData.eyecatch_image_url}
                    onChange={(e) => setFormData({ ...formData, eyecatch_image_url: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">内容（マークダウン形式）</label>
                  <Textarea
                    value={formData.body}
                    onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                    placeholder="マークダウン形式で内容を入力..."
                    className="bg-white/5 border-white/10 text-white min-h-[200px] font-mono text-sm"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    **太字**, *斜体*, # 見出し, - リスト などが使用できます
                  </p>
                </div>

                {/* Publish Status */}
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
                  <div className="flex items-center gap-3">
                    {formData.is_published ? (
                      <Eye size={20} className="text-green-400" />
                    ) : (
                      <EyeOff size={20} className="text-gray-500" />
                    )}
                    <div>
                      <p className="text-white text-sm font-medium">
                        {formData.is_published ? "公開" : "下書き"}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {formData.is_published ? "サイトに表示されます" : "サイトには表示されません"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={formData.is_published}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_published: checked })}
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={resetForm} className="border-white/20 text-gray-400 hover:text-white">
                    キャンセル
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-brass text-anthracite hover:bg-brass-light"
                    disabled={isSaving}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 size={16} className="mr-2 animate-spin" />
                        保存中...
                      </>
                    ) : (
                      editingId ? "更新" : "作成"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* News List */}
        <div className="bg-anthracite border border-white/10 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-brass mx-auto" />
            </div>
          ) : newsList && newsList.length > 0 ? (
            <div className="divide-y divide-white/10">
              {newsList.map((news) => (
                <div key={news.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Thumbnail */}
                    <div className="w-20 h-20 bg-white/5 rounded-lg flex-shrink-0 overflow-hidden">
                      {news.eyecatch_image_url ? (
                        <img src={news.eyecatch_image_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <ImageIcon size={24} />
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {/* Publish Status Badge */}
                        <span className={`text-xs px-2 py-1 rounded ${
                          news.is_published 
                            ? "bg-green-500/10 text-green-400" 
                            : "bg-gray-500/10 text-gray-400"
                        }`}>
                          {news.is_published ? "公開中" : "下書き"}
                        </span>
                        <span className="text-xs text-brass bg-brass/10 px-2 py-1 rounded">
                          {news.category}
                        </span>
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar size={12} />
                          {news.published_at 
                            ? new Date(news.published_at).toLocaleDateString("ja-JP")
                            : new Date(news.created_at).toLocaleDateString("ja-JP")
                          }
                        </span>
                      </div>
                      <h3 className="text-white font-medium mb-1 truncate">{news.title}</h3>
                      <p className="text-gray-500 text-sm line-clamp-2">{news.body}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {/* Toggle Publish */}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleTogglePublish(news)}
                        className={`${
                          news.is_published 
                            ? "text-green-400 hover:text-green-300 hover:bg-green-500/10" 
                            : "text-gray-400 hover:text-white hover:bg-white/10"
                        }`}
                        title={news.is_published ? "非公開にする" : "公開する"}
                      >
                        {news.is_published ? <Eye size={18} /> : <EyeOff size={18} />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(news)}
                        className="text-gray-400 hover:text-white hover:bg-white/10"
                      >
                        <Pencil size={18} />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                            disabled={isDeleting === news.id}
                          >
                            {isDeleting === news.id ? (
                              <Loader2 size={18} className="animate-spin" />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-anthracite border-white/10">
                          <AlertDialogHeader>
                            <AlertDialogTitle className="text-white">削除の確認</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-400">
                              「{news.title}」を削除しますか？この操作は取り消せません。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-white/20 text-gray-400 hover:text-white">
                              キャンセル
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(news.id)}
                              className="bg-red-500 text-white hover:bg-red-600"
                            >
                              削除
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Newspaper size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">まだNEWSがありません</p>
              <p className="text-gray-500 text-sm mt-2">「新規作成」ボタンから最初のNEWSを投稿しましょう</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
