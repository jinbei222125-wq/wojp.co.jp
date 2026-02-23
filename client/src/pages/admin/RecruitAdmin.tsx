import AdminLayout from "@/components/AdminLayout";
import { adminJobsApi, JobItem, ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, MapPin, Briefcase, Banknote, Eye, EyeOff, Loader2 } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

interface JobFormData {
  title: string;
  description: string;
  requirements: string;
  location: string;
  salary_range: string;
  employment_type: string;
  is_published: boolean;
}

export default function RecruitAdmin() {
  const [jobsList, setJobsList] = useState<JobItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    description: "",
    requirements: "",
    location: "",
    salary_range: "",
    employment_type: "",
    is_published: true,
  });

  // Fetch jobs list
  const fetchJobs = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await adminJobsApi.list();
      setJobsList(data);
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "データの取得に失敗しました";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      requirements: "",
      location: "",
      salary_range: "",
      employment_type: "",
      is_published: true,
    });
    setEditingId(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (job: JobItem) => {
    setFormData({
      title: job.title,
      description: job.description,
      requirements: job.requirements,
      location: job.location,
      salary_range: job.salary_range || "",
      employment_type: job.employment_type || "",
      is_published: job.is_published,
    });
    setEditingId(job.id);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      if (editingId) {
        await adminJobsApi.update(editingId, {
          title: formData.title,
          description: formData.description,
          requirements: formData.requirements,
          location: formData.location,
          salary_range: formData.salary_range || undefined,
          employment_type: formData.employment_type || undefined,
          is_published: formData.is_published,
        });
        toast.success("募集職種を更新しました");
      } else {
        await adminJobsApi.create({
          title: formData.title,
          description: formData.description,
          requirements: formData.requirements,
          location: formData.location,
          salary_range: formData.salary_range || undefined,
          employment_type: formData.employment_type || undefined,
          is_published: formData.is_published,
        });
        toast.success("募集職種を作成しました");
      }
      resetForm();
      fetchJobs();
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
      await adminJobsApi.delete(id);
      toast.success("募集職種を削除しました");
      fetchJobs();
    } catch (error) {
      const message = error instanceof ApiError ? error.message : "削除に失敗しました";
      toast.error(message);
    } finally {
      setIsDeleting(null);
    }
  };

  const handleTogglePublish = async (job: JobItem) => {
    try {
      await adminJobsApi.togglePublish(job.id, !job.is_published);
      toast.success(job.is_published ? "非公開にしました" : "公開しました");
      fetchJobs();
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
            <h1 className="text-3xl font-display font-bold text-white">採用情報管理</h1>
            <p className="text-gray-400 mt-2">募集職種の投稿・編集</p>
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
                  {editingId ? "募集職種編集" : "募集職種新規作成"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6 mt-4">
                {/* Position Name */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">ポジション名</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="例: キャリアアドバイザー"
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>

                {/* Employment Type */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">雇用形態</label>
                  <Input
                    value={formData.employment_type}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                    placeholder="例: 正社員 / 契約社員 / 業務委託"
                    className="bg-white/5 border-white/10 text-white"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">業務内容</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="業務内容を入力..."
                    className="bg-white/5 border-white/10 text-white min-h-[120px]"
                    required
                  />
                </div>

                {/* Requirements */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">応募資格</label>
                  <Textarea
                    value={formData.requirements}
                    onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                    placeholder="応募資格を入力..."
                    className="bg-white/5 border-white/10 text-white min-h-[120px]"
                    required
                  />
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">勤務地</label>
                  <Input
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="例: 東京都渋谷区（リモート可）"
                    className="bg-white/5 border-white/10 text-white"
                    required
                  />
                </div>

                {/* Salary */}
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">給与</label>
                  <Input
                    value={formData.salary_range}
                    onChange={(e) => setFormData({ ...formData, salary_range: e.target.value })}
                    placeholder="例: 月給25万円〜50万円（経験・能力による）"
                    className="bg-white/5 border-white/10 text-white"
                  />
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

        {/* Jobs List */}
        <div className="bg-anthracite border border-white/10 rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-brass mx-auto" />
            </div>
          ) : jobsList && jobsList.length > 0 ? (
            <div className="divide-y divide-white/10">
              {jobsList.map((job) => (
                <div key={job.id} className="p-6 hover:bg-white/5 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Status Indicator */}
                    <div className={`w-3 h-3 rounded-full mt-2 flex-shrink-0 ${job.is_published ? "bg-green-400" : "bg-gray-500"}`} />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-white font-medium">{job.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${job.is_published ? "text-green-400 bg-green-500/10" : "text-gray-400 bg-gray-500/10"}`}>
                          {job.is_published ? "公開中" : "非公開"}
                        </span>
                        {job.employment_type && (
                          <span className="text-xs text-brass bg-brass/10 px-2 py-1 rounded">
                            {job.employment_type}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {job.location}
                        </span>
                        {job.salary_range && (
                          <span className="flex items-center gap-1">
                            <Banknote size={14} />
                            {job.salary_range}
                          </span>
                        )}
                      </div>
                      <p className="text-gray-500 text-sm mt-2 line-clamp-2">{job.description}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={job.is_published}
                        onCheckedChange={() => handleTogglePublish(job)}
                        className="data-[state=checked]:bg-green-500"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(job)}
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
                            disabled={isDeleting === job.id}
                          >
                            {isDeleting === job.id ? (
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
                              「{job.title}」を削除しますか？この操作は取り消せません。
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-white/20 text-gray-400 hover:text-white">
                              キャンセル
                            </AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(job.id)}
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
              <Briefcase size={48} className="mx-auto text-gray-600 mb-4" />
              <p className="text-gray-400">まだ募集職種がありません</p>
              <p className="text-gray-500 text-sm mt-2">「新規作成」ボタンから最初の募集職種を追加しましょう</p>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
