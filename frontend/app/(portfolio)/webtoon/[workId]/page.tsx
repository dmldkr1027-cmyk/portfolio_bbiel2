'use client';

import { use, useState, useRef } from 'react';
import Image from 'next/image';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import { AdminModal } from '@/components/admin-modal';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Empty, EmptyContent, EmptyTitle, EmptyDescription, EmptyMedia } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import { Upload, ImageIcon, Trash2, ArrowLeft, ArrowUp, ArrowDown, Type, Save, Bold, Italic, Palette, Edit2, GripHorizontal } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const workNames: Record<string, string> = {
  'work-1': '배드 럭 큐피드',
  'work-2': '내가 잘못했어!',
  'work-3': '쓰레기는 이제 그만!',
};

interface PageProps {
  params: Promise<{ workId: string }>;
}

interface ImageLoadingState {
  [key: string]: boolean;
}

const EditableTextItem = ({ artwork, onReorder, onDelete, index, total }: { artwork: any, onReorder: any, onDelete: any, index: number, total: number }) => {
  const [pad, setPad] = useState<{top: number, bottom: number}>(() => {
    try {
      if (artwork.description) return JSON.parse(artwork.description);
    } catch {}
    return { top: 40, bottom: 40 };
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isHover, setIsHover] = useState(false);
  const [content, setContent] = useState(artwork.content || '');
  const editorRef = useRef<HTMLDivElement>(null);

  const saveContent = async () => {
    if (!editorRef.current) return;
    const newHtml = editorRef.current.innerHTML;
    setContent(newHtml);
    setIsEditing(false);
    await fetch(`/api/artworks/${artwork.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newHtml })
    });
  };

  const updatePadding = async (newPad: {top: number, bottom: number}) => {
    setPad(newPad);
    await fetch(`/api/artworks/${artwork.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ description: JSON.stringify(newPad) })
    });
  };

  return (
    <div 
      className="relative group w-full pt-6 pb-6 border-b border-transparent hover:border-slate-200 transition-colors"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
    >
      <div 
        className={`absolute top-0 left-0 right-0 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 cursor-ns-resize transition-opacity z-30 ${isHover && !isEditing ? 'opacity-100' : 'opacity-0'}`}
        onMouseDown={(e) => {
          e.preventDefault();
          const startY = e.clientY;
          const startPad = pad.top;
          let newPad = startPad;
          
          const onMove = (m: MouseEvent) => {
             const diff = m.clientY - startY;
             newPad = Math.max(0, startPad + diff);
             setPad({ ...pad, top: newPad });
          };
          const onUp = () => {
             window.removeEventListener('mousemove', onMove);
             window.removeEventListener('mouseup', onUp);
             updatePadding({ ...pad, top: newPad });
          };
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
        }}
        title="드래그하여 상단 여백 조절"
      >
        <GripHorizontal className="h-4 w-4 text-slate-400" />
      </div>

      <div 
        className="w-full flex justify-center px-4 sm:px-6"
        style={{ paddingTop: pad.top, paddingBottom: pad.bottom }}
      >
        {isEditing ? (
           <div className="w-full max-w-2xl border rounded-md p-4 bg-white z-20 relative">
             <div className="bg-slate-50 border-b p-2 flex flex-wrap items-center gap-2 mb-4 select-none rounded">
                  <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => document.execCommand('bold', false)}>
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => document.execCommand('italic', false)}>
                    <Italic className="w-4 h-4" />
                  </Button>
                  <div className="h-4 w-px bg-slate-300 mx-1" />
                  <select 
                    className="h-8 rounded border px-2 text-sm bg-white" 
                    onChange={(e) => document.execCommand('fontSize', false, e.target.value)}
                    defaultValue="3"
                  >
                    <option value="2">작게</option>
                    <option value="3">보통</option>
                    <option value="5">크게</option>
                    <option value="7">아주 크게</option>
                  </select>
                  <div className="flex items-center gap-1 border p-1 rounded bg-white overflow-hidden ml-1">
                    <Palette className="w-4 h-4 text-slate-500" />
                    <input 
                      type="color" 
                      className="w-6 h-6 p-0 border-0 cursor-pointer bg-transparent" 
                      onChange={(e) => document.execCommand('foreColor', false, e.target.value)}
                      title="글자 색상"
                    />
                  </div>
             </div>
             <div 
               ref={editorRef}
               contentEditable={true}
               suppressContentEditableWarning={true}
               className="min-h-[150px] outline-none text-center leading-relaxed font-sans break-words bg-slate-50 p-4 rounded"
               dangerouslySetInnerHTML={{ __html: content }}
             />
             <div className="flex justify-end gap-2 mt-4">
               <Button variant="outline" onClick={() => setIsEditing(false)}>취소</Button>
               <Button onClick={saveContent}><Save className="w-4 h-4 mr-2" />저장</Button>
             </div>
           </div>
        ) : (
          <div 
            className="w-full text-center leading-relaxed font-sans break-words max-w-2xl"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        )}
      </div>

      <div 
        className={`absolute bottom-0 left-0 right-0 h-6 flex items-center justify-center bg-slate-100 hover:bg-slate-200 cursor-ns-resize transition-opacity z-30 ${isHover && !isEditing ? 'opacity-100' : 'opacity-0'}`}
        onMouseDown={(e) => {
          e.preventDefault();
          const startY = e.clientY;
          const startPad = pad.bottom;
          let newPad = startPad;
          
          const onMove = (m: MouseEvent) => {
             const diff = m.clientY - startY; 
             newPad = Math.max(0, startPad + diff);
             setPad({ ...pad, bottom: newPad });
          };
          const onUp = () => {
             window.removeEventListener('mousemove', onMove);
             window.removeEventListener('mouseup', onUp);
             updatePadding({ ...pad, bottom: newPad });
          };
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
        }}
        title="드래그하여 하단 여백 조절"
      >
        <GripHorizontal className="h-4 w-4 text-slate-400" />
      </div>

      {!isEditing && (
        <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-2 rounded-lg shadow-sm border border-slate-200 backdrop-blur-sm z-40">
          <div className="flex justify-center text-xs font-mono text-slate-400 mb-1 border-b pb-1">관리</div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsEditing(true)}
            className="h-8 w-8 text-slate-600 hover:text-[#006699]"
            title="텍스트 수정"
          >
            <Edit2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.preventDefault(); onReorder(artwork.id, 'up'); }}
            disabled={index === 0}
            className="h-8 w-8 text-slate-600 hover:text-[#006699] disabled:opacity-30"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => { e.preventDefault(); onReorder(artwork.id, 'down'); }}
            disabled={index === total - 1}
            className="h-8 w-8 text-slate-600 hover:text-[#006699] disabled:opacity-30"
          >
            <ArrowDown className="h-4 w-4" />
          </Button>
          <AdminModal trigger={<Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 mt-1 border-t"><Trash2 className="h-4 w-4" /></Button>}>
            <div className="space-y-4">
              <p className="text-slate-700">정말 삭제하시겠습니까?</p>
              <div className="flex gap-3">
                <Button variant="destructive" className="flex-1" onClick={() => onDelete(artwork.id)}>삭제</Button>
              </div>
            </div>
          </AdminModal>
        </div>
      )}
    </div>
  );
};

export default function WebtoonWorkDirectPage({ params }: PageProps) {
  const router = useRouter();
  const { workId } = use(params);
  const { data, mutate, isLoading } = useSWR(
    `/api/artworks?category=webtoon&subcategory=${workId}`,
    fetcher
  );
  const [uploading, setUploading] = useState(false);
  const [isSubmittingText, setIsSubmittingText] = useState(false);
  const [imageLoadingStates, setImageLoadingStates] = useState<ImageLoadingState>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  const execCmd = (cmd: string, val?: string) => {
    document.execCommand(cmd, false, val);
    if (editorRef.current) editorRef.current.focus();
  };

  const getImageSrc = (url: string | null) => {
    if (!url) return '';
    if (url.includes('blob.vercel-storage.com')) {
      const urlObj = new URL(url);
      const pathname = urlObj.pathname.slice(1);
      return `/api/file?pathname=${encodeURIComponent(pathname)}`;
    }
    return url;
  };

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const uploadData = await res.json();
        
        if (uploadData.error) {
          console.error('Upload error:', uploadData.error);
          continue;
        }
        
        if (uploadData.url) {
          await fetch('/api/artworks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: file.name.replace(/\.[^/.]+$/, ''),
              description: '',
              thumbnailUrl: uploadData.url,
              imageUrls: [uploadData.url],
              category: 'webtoon',
              subcategory: workId,
              type: 'image'
            }),
          });
        }
      }
      mutate();
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleAddText = async () => {
    if (!editorRef.current) return;
    const htmlContent = editorRef.current.innerHTML;
    if (!htmlContent.trim() || htmlContent === '<br>') return;
    
    setIsSubmittingText(true);
    try {
      await fetch('/api/artworks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '텍스트 블록',
          description: JSON.stringify({ top: 40, bottom: 40 }),
          thumbnailUrl: '',
          imageUrls: [],
          category: 'webtoon',
          subcategory: workId,
          type: 'text',
          content: htmlContent
        }),
      });
      if (editorRef.current) editorRef.current.innerHTML = '';
      mutate();
    } catch (error) {
      console.error('Text submission failed:', error);
    } finally {
      setIsSubmittingText(false);
    }
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/artworks/${id}`, { method: 'DELETE' });
    mutate();
  };

  const handleReorder = async (id: string, direction: 'up' | 'down') => {
    await fetch(`/api/artworks/${id}/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ direction }),
    });
    mutate();
  };

  const handleImageLoad = (id: string) => {
    setImageLoadingStates((prev) => ({ ...prev, [id]: false }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-4xl mx-auto py-8">
        <Button variant="ghost" onClick={() => router.back()} className="text-muted-foreground hover:text-foreground -ml-2 mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" /> 목록으로 돌아가기
        </Button>
        <Skeleton className="h-8 w-48" />
        <div className="space-y-0">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-96 w-full mt-4" />
          ))}
        </div>
      </div>
    );
  }

  const artworks = data?.artworks || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-8">
      <Button variant="ghost" onClick={() => router.back()} className="text-muted-foreground hover:text-foreground -ml-2 mb-2 transition-colors">
        <ArrowLeft className="mr-2 h-4 w-4" /> 목록으로 돌아가기
      </Button>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between pb-4 border-b">
        <h1 className="text-2xl md:text-3xl font-bold text-[#006699]">
          {workNames[workId] || '작품'}
        </h1>
        
        <div className="flex items-center gap-2">
          <AdminModal
            trigger={
              <Button variant="outline" size="sm" disabled={uploading}>
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? '업로드 중...' : '컷 추가 (관리자)'}
              </Button>
            }
          >
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">새로운 원고 이미지를 선택하여 업로드합니다.</p>
              <Button
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {uploading ? <><Spinner className="mr-2 h-4 w-4" />업로드 중...</> : '이미지 파일 선택'}
              </Button>
            </div>
          </AdminModal>

          <AdminModal
            trigger={
              <Button variant="outline" size="sm" disabled={isSubmittingText}>
                <Type className="mr-2 h-4 w-4" />
                텍스트 삽입 (관리자)
              </Button>
            }
          >
            <div className="space-y-4">
              <p className="text-sm text-foreground font-medium">텍스트 블록 삽입</p>
              <p className="text-sm text-muted-foreground">블로그나 티스토리처럼 원고 중간에 들어갈 텍스트를 입력하세요.</p>
              
              <div className="border rounded-md flex flex-col bg-white">
                <div className="bg-slate-50 border-b p-2 flex flex-wrap items-center gap-2 select-none">
                  <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => execCmd('bold')} disabled={isSubmittingText}>
                    <Bold className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => execCmd('italic')} disabled={isSubmittingText}>
                    <Italic className="w-4 h-4" />
                  </Button>
                  <div className="h-4 w-px bg-slate-300 mx-1" />
                  <select 
                    className="h-8 rounded border px-2 text-sm bg-white" 
                    onChange={(e) => execCmd('fontSize', e.target.value)}
                    defaultValue="3"
                    disabled={isSubmittingText}
                  >
                    <option value="2">작게</option>
                    <option value="3">보통</option>
                    <option value="5">크게</option>
                    <option value="7">아주 크게</option>
                  </select>
                  <div className="h-4 w-px bg-slate-300 mx-1" />
                  <div className="flex items-center gap-1 border p-1 rounded bg-white overflow-hidden">
                    <Palette className="w-4 h-4 text-slate-500" />
                    <input 
                      type="color" 
                      className="w-6 h-6 p-0 border-0 cursor-pointer bg-transparent" 
                      onChange={(e) => execCmd('foreColor', e.target.value)}
                      title="글자 색상"
                      disabled={isSubmittingText}
                    />
                  </div>
                </div>
                <div 
                  ref={editorRef}
                  contentEditable={!isSubmittingText}
                  className="min-h-[150px] p-4 text-base outline-none focus:bg-slate-50 transition-colors"
                  style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
                />
              </div>

              <Button
                className="w-full"
                onClick={handleAddText}
                disabled={isSubmittingText}
              >
                {isSubmittingText ? <><Spinner className="mr-2 h-4 w-4" />저장 중...</> : <><Save className="mr-2 h-4 w-4" />텍스트 저장</>}
              </Button>
            </div>
          </AdminModal>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleUpload(e.target.files);
                e.target.value = '';
              }
            }}
          />
        </div>
      </div>

      {artworks.length > 0 ? (
        <div className="flex flex-col bg-white w-full mx-auto max-w-[800px] rounded-none overflow-hidden ">
          {artworks.map((artwork: { id: string; thumbnailUrl: string; title: string; type?: string; content?: string }, index: number) => {
            const isText = artwork.type === 'text';
            const isLoading = imageLoadingStates[artwork.id] !== false && !isText;
            const imageSrc = isText ? '' : getImageSrc(artwork.thumbnailUrl);
            
            return (
              <div key={artwork.id}>
                {isText ? (
                  <EditableTextItem 
                    artwork={artwork} 
                    onReorder={handleReorder} 
                    onDelete={handleDelete} 
                    index={index} 
                    total={artworks.length} 
                  />
                ) : (
                  <div className="relative group w-full flex justify-center leading-[0] align-top mix-blend-normal isolate">
                    {isLoading && imageSrc && (
                      <div className="absolute inset-0 flex items-center justify-center z-10 w-full h-full min-h-[100px]">
                        <Spinner className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                    {imageSrc && (
                      <Image
                        src={imageSrc}
                        alt={artwork.title}
                        width={800}
                        height={1200}
                        className="w-full h-auto block m-0 p-0"
                        style={{ display: 'block', objectFit: 'contain' }}
                        onLoad={() => handleImageLoad(artwork.id)}
                        onError={() => handleImageLoad(artwork.id)}
                        unoptimized
                      />
                    )}
                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 p-2 rounded-lg shadow-sm border border-slate-200 backdrop-blur-sm z-20">
                      <div className="flex justify-center text-xs font-mono text-slate-400 mb-1 border-b pb-1">관리</div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleReorder(artwork.id, 'up'); }}
                        disabled={index === 0}
                        className="h-8 w-8 text-slate-600 hover:text-[#006699] disabled:opacity-30"
                        title="위로 이동"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleReorder(artwork.id, 'down'); }}
                        disabled={index === artworks.length - 1}
                        className="h-8 w-8 text-slate-600 hover:text-[#006699] disabled:opacity-30"
                        title="아래로 이동"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <AdminModal
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50 mt-1 border-t"
                            title="삭제"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        }
                      >
                        <div className="space-y-4">
                          <p className="text-slate-700">이 블록을 정말 삭제하시겠습니까?</p>
                          <div className="flex gap-3">
                            <Button
                              variant="destructive"
                              className="flex-1"
                              onClick={() => handleDelete(artwork.id)}
                            >
                              삭제
                            </Button>
                          </div>
                        </div>
                      </AdminModal>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <Empty>
          <EmptyContent>
            <EmptyMedia variant="icon">
              <Type />
            </EmptyMedia>
            <EmptyTitle>등록된 내용이 없습니다.</EmptyTitle>
            <EmptyDescription>상단의 버튼을 눌러 원고 이미지를 업로드하거나 텍스트를 삽입하세요.</EmptyDescription>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}
