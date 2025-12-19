"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Wrench,
  Building2,
  Package,
  Star,
  Search,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TicketDetail } from "@/components/ticket-detail";
import { FeedbackDataTable } from "@/components/feedback-data-table";

interface Feedback {
  form_id: number;
  form_name: string;
  form_status: string;
  form_description: string;
  is_active: boolean;
  created_at: string;
}

interface Ticket {
  request_id: string;
  Status: number;
  asset_id?: string;
  username: string;
  work?: string;
  detail_work?: string;
  problem_description?: string;
  type_of_work?: string;
  form_type?: string;
  created_at: string;
  updated_at?: string;
  finish_with?: string;
  start_repair?: string;
  finish_repair?: string;
  cost?: string;
  device_name?: string;
}

interface Asset {
  site: string;
  company: string;
  category: string;
}

export default function ReportPage() {
  const router = useRouter();
  const { user, logout, isLoading } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);

  const [feedbackStats, setFeedbackStats] = useState({
    total: 0,
    excellent: 0,
    good: 0,
    fair: 0,
    poor: 0,
    bad: 0,
    avgRating: 0,
  });

  const [ticketStats, setTicketStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
    cancelled: 0,
    waitingReview: 0,
    requestCount: 0,
    repairCount: 0,
    totalCost: 0,
  });

  const [companyStats, setCompanyStats] = useState<{ [key: string]: number }>({});
  const [companies, setCompanies] = useState<Array<{ id: number; company_code: string; company_name: string }>>([]);
  const [categoryStats, setCategoryStats] = useState<{ [key: string]: number }>(
    {}
  );
  const [workStats, setWorkStats] = useState<{ [key: string]: number }>({});
  const [userStats, setUserStats] = useState<{ [key: string]: number }>({});
  const [assetStats, setAssetStats] = useState<{ [key: string]: number }>({});
  const [technicianRatings, setTechnicianRatings] = useState<{ 
    [key: string]: { 
      total: number; 
      ratings: number[]; 
      avgRating: number;
      excellent: number;
      good: number;
      fair: number;
      poor: number;
      bad: number;
    } 
  }>({});

  // State สำหรับ Dialog
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  const [companyDetailStats, setCompanyDetailStats] = useState<{
    [key: string]: number;
  }>({});
  const [companySiteStats, setCompanySiteStats] = useState<{
    [key: string]: number;
  }>({});
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [siteDetailStats, setSiteDetailStats] = useState<{
    [key: string]: number;
  }>({});
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSiteDialogOpen, setIsSiteDialogOpen] = useState(false);
  const [isWorkDialogOpen, setIsWorkDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isAssetDialogOpen, setIsAssetDialogOpen] = useState(false);
  const [isCostDialogOpen, setIsCostDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categoryAssets, setCategoryAssets] = useState<Asset[]>([]);
  const [costDialogDateFilter, setCostDialogDateFilter] = useState<string>("all");
  const [costDialogCustomStartDate, setCostDialogCustomStartDate] = useState<string>("");
  const [costDialogCustomEndDate, setCostDialogCustomEndDate] = useState<string>("");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [ratingFilter, setRatingFilter] = useState<string>("all");

  // State สำหรับ DataTable
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  const handleTicketClick = async (feedbackOrRequestId: Feedback | string) => {
    try {
      const requestId = typeof feedbackOrRequestId === 'string' 
        ? feedbackOrRequestId 
        : feedbackOrRequestId.form_name;
      
      const response = await fetch(`/api/tickets/${requestId}`);
      if (response.ok) {
        const ticketData = await response.json();
        setSelectedTicket(ticketData);
        setIsTicketDialogOpen(true);
      }
    } catch (error) {
      console.error("Failed to fetch ticket details:", error);
    }
  };

  const handleCompanyClick = async (companyName: string) => {
    setSelectedCompany(companyName);
    setIsDialogOpen(true);

    // ดึงข้อมูลทรัพย์สินของบริษัทนั้นๆ
    const companyAssets = assets.filter((asset) => asset.company === companyName);
    
    // แยกตามสาขา
    const siteCount: { [key: string]: number } = {};
    companyAssets.forEach((asset: Asset) => {
      if (asset.site) {
        siteCount[asset.site] = (siteCount[asset.site] || 0) + 1;
      }
    });
    setCompanySiteStats(siteCount);
    
    // แยกตามประเภท
    const categoryCount: { [key: string]: number } = {};
    companyAssets.forEach((asset: Asset) => {
      if (asset.category) {
        categoryCount[asset.category] =
          (categoryCount[asset.category] || 0) + 1;
      }
    });
    setCompanyDetailStats(categoryCount);
  };

  const handleSiteClick = async (siteName: string, companyName: string) => {
    setSelectedSite(siteName);
    setIsSiteDialogOpen(true);

    // ดึงข้อมูลทรัพย์สินของสาขานั้นๆ ในบริษัทที่เลือก
    const siteAssets = assets.filter(
      (asset) => asset.site === siteName && asset.company === companyName
    );
    
    // แยกตามประเภท
    const categoryCount: { [key: string]: number } = {};
    siteAssets.forEach((asset: Asset) => {
      if (asset.category) {
        categoryCount[asset.category] =
          (categoryCount[asset.category] || 0) + 1;
      }
    });
    setSiteDetailStats(categoryCount);
  };

  // Helper function to get company name from company code
  const getCompanyName = (code: string) => {
    const company = companies.find(c => c.company_code === code);
    return company ? company.company_name : code;
  };

  const handleCategoryClick = async (categoryName: string) => {
    setSelectedCategory(categoryName);
    setIsCategoryDialogOpen(true);

    // ดึงข้อมูลทรัพย์สินของประเภทนั้นๆ
    const filtered = assets.filter((asset) => asset.category === categoryName);
    setCategoryAssets(filtered);
  };

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.push("/");
      return;
    }
    if (user.role !== "admin") {
      router.push("/dashboard");
      return;
    }
  }, [user, router, isLoading]);

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    if (tickets.length > 0) {
      fetchTickets();
    }
    if (feedbacks.length > 0) {
      fetchFeedbacks();
    }
  }, [dateFilter, customStartDate, customEndDate]);

  const fetchAllData = async () => {
    try {
      await Promise.all([fetchFeedbacks(), fetchTickets(), fetchAssets(), fetchCompanies()]);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterFeedbacksByDate = (feedbacks: any[]) => {
    if (dateFilter === "all") return feedbacks;

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    return feedbacks.filter((f: any) => {
      if (!f.created_at) return false;
      const feedbackDate = new Date(f.created_at);

      switch (dateFilter) {
        case "today":
          return feedbackDate >= startOfToday;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return feedbackDate >= weekAgo;
        case "month":
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          return feedbackDate >= monthStart;
        case "year":
          const yearStart = new Date(now.getFullYear(), 0, 1);
          return feedbackDate >= yearStart;
        case "custom":
          if (!customStartDate || !customEndDate) return true;
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          return feedbackDate >= start && feedbackDate <= end;
        default:
          return true;
      }
    });
  };

  const fetchFeedbacks = async () => {
    try {
      const response = await fetch("/api/feedback");
      if (response.ok) {
        const allData = await response.json();
        setFeedbacks(allData);

        const data = filterFeedbacksByDate(allData);

        const total = data.length;
        const ratings = data.map((f: Feedback) => parseInt(f.form_status));
        const excellent = ratings.filter((r: number) => r === 5).length;
        const good = ratings.filter((r: number) => r === 4).length;
        const fair = ratings.filter((r: number) => r === 3).length;
        const poor = ratings.filter((r: number) => r === 2).length;
        const bad = ratings.filter((r: number) => r === 1).length;
        const avgRating =
          total > 0
            ? (
                ratings.reduce((a: number, b: number) => a + b, 0) / total
              ).toFixed(2)
            : 0;

        setFeedbackStats({
          total,
          excellent,
          good,
          fair,
          poor,
          bad,
          avgRating: Number(avgRating),
        });

        // วิเคราะห์การประเมินตามผู้รับซ่อม
        await analyzeTechnicianRatings(allData);
      }
    } catch (error) {
      console.error("Failed to fetch feedbacks:", error);
    }
  };

  const analyzeTechnicianRatings = async (feedbackData: Feedback[]) => {
    try {
      // ดึงข้อมูล tickets เพื่อดูว่าใครเป็นคนซ่อม
      const response = await fetch("/api/tickets");
      if (response.ok) {
        const ticketsData = await response.json();
        
        const techStats: { 
          [key: string]: { 
            total: number; 
            ratings: number[]; 
            avgRating: number;
            excellent: number;
            good: number;
            fair: number;
            poor: number;
            bad: number;
          } 
        } = {};

        // จับคู่ feedback กับ ticket เพื่อหาผู้รับซ่อม
        feedbackData.forEach((feedback) => {
          const ticket = ticketsData.find((t: Ticket) => t.request_id === feedback.form_name);
          if (ticket && ticket.finish_with) {
            const technician = ticket.finish_with;
            const rating = parseInt(feedback.form_status);

            if (!techStats[technician]) {
              techStats[technician] = {
                total: 0,
                ratings: [],
                avgRating: 0,
                excellent: 0,
                good: 0,
                fair: 0,
                poor: 0,
                bad: 0,
              };
            }

            techStats[technician].total++;
            techStats[technician].ratings.push(rating);

            if (rating === 5) techStats[technician].excellent++;
            else if (rating === 4) techStats[technician].good++;
            else if (rating === 3) techStats[technician].fair++;
            else if (rating === 2) techStats[technician].poor++;
            else if (rating === 1) techStats[technician].bad++;
          }
        });

        // คำนวณคะแนนเฉลี่ย
        Object.keys(techStats).forEach((tech) => {
          const ratings = techStats[tech].ratings;
          if (ratings.length > 0) {
            const sum = ratings.reduce((a, b) => a + b, 0);
            techStats[tech].avgRating = Number((sum / ratings.length).toFixed(2));
          }
        });

        setTechnicianRatings(techStats);
      }
    } catch (error) {
      console.error("Failed to analyze technician ratings:", error);
    }
  };

  const filterTicketsByDate = (tickets: Ticket[]) => {
    if (dateFilter === "all") return tickets;

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    return tickets.filter((t: any) => {
      if (!t.created_at) return false;
      const ticketDate = new Date(t.created_at);

      switch (dateFilter) {
        case "today":
          return ticketDate >= startOfToday;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return ticketDate >= weekAgo;
        case "month":
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          return ticketDate >= monthStart;
        case "year":
          const yearStart = new Date(now.getFullYear(), 0, 1);
          return ticketDate >= yearStart;
        case "custom":
          if (!customStartDate || !customEndDate) return true;
          const start = new Date(customStartDate);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          return ticketDate >= start && ticketDate <= end;
        default:
          return true;
      }
    });
  };

  const filterTicketsByDateForDialog = (tickets: Ticket[]) => {
    if (costDialogDateFilter === "all") return tickets;

    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    return tickets.filter((t: any) => {
      if (!t.created_at) return false;
      const ticketDate = new Date(t.created_at);

      switch (costDialogDateFilter) {
        case "today":
          return ticketDate >= startOfToday;
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return ticketDate >= weekAgo;
        case "month":
          const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
          return ticketDate >= monthStart;
        case "year":
          const yearStart = new Date(now.getFullYear(), 0, 1);
          return ticketDate >= yearStart;
        case "custom":
          if (!costDialogCustomStartDate || !costDialogCustomEndDate) return true;
          const start = new Date(costDialogCustomStartDate);
          const end = new Date(costDialogCustomEndDate);
          end.setHours(23, 59, 59, 999);
          return ticketDate >= start && ticketDate <= end;
        default:
          return true;
      }
    });
  };

  const fetchTickets = async () => {
    try {
      const response = await fetch("/api/tickets");
      if (response.ok) {
        const allData = await response.json();
        setTickets(allData);

        const data = filterTicketsByDate(allData);

        const total = data.length;
        const pending = data.filter((t: Ticket) => t.Status === 0).length;
        const inProgress = data.filter((t: Ticket) => t.Status === 1).length;
        const completed = data.filter((t: Ticket) => t.Status === 2).length;
        const cancelled = data.filter((t: Ticket) => t.Status === 3).length;
        const waitingReview = data.filter((t: Ticket) => t.Status === 4).length;
        const requestCount = data.filter(
          (t: Ticket) => t.form_type === "request"
        ).length;
        const repairCount = data.filter(
          (t: Ticket) => t.form_type === "repair"
        ).length;

        // นับรายการงาน (work)
        const workCount: { [key: string]: number } = {};
        data.forEach((t: Ticket) => {
          if (t.work) {
            workCount[t.work] = (workCount[t.work] || 0) + 1;
          }
        });
        setWorkStats(workCount);

        // นับผู้แจ้ง (username)
        const userCount: { [key: string]: number } = {};
        data.forEach((t: Ticket) => {
          if (t.username) {
            userCount[t.username] = (userCount[t.username] || 0) + 1;
          }
        });
        setUserStats(userCount);

        // นับทรัพย์สิน (device_name หรือ asset_id)
        const assetCount: { [key: string]: number } = {};
        data.forEach((t: Ticket) => {
          const assetKey = t.device_name || t.asset_id;
          if (assetKey) {
            assetCount[assetKey] = (assetCount[assetKey] || 0) + 1;
          }
        });
        setAssetStats(assetCount);

        // คำนวณค่าใช้จ่ายรวมทั้งหมด
        const totalCost = data.reduce((sum: number, t: Ticket) => {
          if (t.cost && t.cost.trim() !== "") {
            // ลบเครื่องหมาย , และ ฿ ออกก่อนแปลงเป็นตัวเลข
            const costNumber = parseFloat(t.cost.replace(/[,฿]/g, ""));
            return sum + (isNaN(costNumber) ? 0 : costNumber);
          }
          return sum;
        }, 0);

        setTicketStats({
          total,
          pending,
          inProgress,
          completed,
          cancelled,
          waitingReview,
          requestCount,
          repairCount,
          totalCost,
        });
      }
    } catch (error) {
      console.error("Failed to fetch tickets:", error);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch('/api/company');
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const fetchAssets = async () => {
    try {
      const response = await fetch("/api/assets");
      if (response.ok) {
        const result = await response.json();
        console.log("Assets API response:", result);

        // API ส่งกลับมาเป็น { success: true, data: [...] }
        const data = result.success ? result.data : [];
        setAssets(data);

        console.log("Total assets:", data.length);

        const companyCount: { [key: string]: number } = {};
        data.forEach((asset: Asset) => {
          if (asset.company) {
            companyCount[asset.company] = (companyCount[asset.company] || 0) + 1;
          }
        });
        setCompanyStats(companyCount);
        console.log("Company stats:", companyCount);

        const categoryCount: { [key: string]: number } = {};
        data.forEach((asset: Asset) => {
          if (asset.category) {
            categoryCount[asset.category] =
              (categoryCount[asset.category] || 0) + 1;
          }
        });
        setCategoryStats(categoryCount);
        console.log("Category stats:", categoryCount);
      }
    } catch (error) {
      console.error("Failed to fetch assets:", error);
    }
  };

  const getRatingLabel = (rating: string) => {
    const labels: { [key: string]: string } = {
      "5": "พึงพอใจมากที่สุด",
      "4": "พึงพอใจมาก",
      "3": "พึงพอใจปานกลาง",
      "2": "พึงพอใจน้อย",
      "1": "ไม่พึงพอใจ",
    };
    return labels[rating] || "ไม่ระบุ";
  };

  const getRatingBadge = (rating: string) => {
    const styles: { [key: string]: string } = {
      "5": "bg-green-100 text-green-800 border-green-300",
      "4": "bg-blue-100 text-blue-800 border-blue-300",
      "3": "bg-yellow-100 text-yellow-800 border-yellow-300",
      "2": "bg-orange-100 text-orange-800 border-orange-300",
      "1": "bg-red-100 text-red-800 border-red-300",
    };
    return styles[rating] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  // Filter และ Pagination สำหรับ tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.request_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.work || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.problem_description || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || ticket.Status.toString() === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTickets = filteredTickets.slice(startIndex, endIndex);

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0:
        return (
          <Badge className="bg-orange-100 text-orange-800 border-orange-300">
            รอดำเนินการ
          </Badge>
        );
      case 1:
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-300">
            กำลังดำเนินการ
          </Badge>
        );
      case 2:
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            เสร็จสิ้น
          </Badge>
        );
      case 3:
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            ยกเลิก
          </Badge>
        );
      case 4:
        return (
          <Badge className="bg-purple-100 text-purple-800 border-purple-300">
            รอการประเมิน
          </Badge>
        );
      default:
        return <Badge variant="outline">สถานะ: {status}</Badge>;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b">
          <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/dashboard")}
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">ระบบบำรุงรักษา</h1>
                <p className="text-sm text-muted-foreground">
                  รายงานการประเมิน
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="font-medium text-sm">
                  {user?.name || user?.username}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role}
                </p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </header>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-[calc(100vh-200px)]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">กำลังโหลดข้อมูล...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/dashboard")}
                className="shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-base sm:text-xl md:text-2xl font-bold truncate">
                  ระบบบำรุงรักษา
                </h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                  รายงานการประเมิน
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <div className="text-right hidden md:block">
                <p className="font-medium text-sm">
                  {user?.username}
                </p>
                <p className="text-xs">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {user?.department} | {user?.site}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-xs sm:text-sm px-2 sm:px-4"
              >
                <span className="hidden sm:inline">Logout</span>
                <span className="sm:hidden">ออก</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold">
              รายงานสถิติระบบบำรุงรักษา
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              สรุปภาพรวมการทำงานของระบบ
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="ระยะเวลา" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                <SelectItem value="today">วันนี้</SelectItem>
                <SelectItem value="week">สัปดาห์นี้</SelectItem>
                <SelectItem value="month">เดือนนี้</SelectItem>
                <SelectItem value="year">ปีนี้</SelectItem>
                <SelectItem value="custom">กำหนดเอง</SelectItem>
              </SelectContent>
            </Select>
            {dateFilter === "custom" && (
              <div className="flex gap-2 w-full sm:w-auto">
                <Input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full sm:w-[150px]"
                  placeholder="วันเริ่มต้น"
                />
                <Input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full sm:w-[150px]"
                  placeholder="วันสิ้นสุด"
                />
              </div>
            )}
          </div>
        </div>

        <Tabs defaultValue="tickets" className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 gap-1 mb-6 sm:mb-6 transition-all duration-300 ease-in-out scroll-smooth">
            <TabsTrigger
              value="tickets"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2.5 sm:py-2.5 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Wrench className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">การแจ้งซ่อม</span>
              <span className="sm:hidden">แจ้งซ่อม</span>
            </TabsTrigger>
            <TabsTrigger
              value="sites"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Building2 className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">ทรัพย์สินตามบริษัท</span>
              <span className="sm:hidden">บริษัท</span>
            </TabsTrigger>
            <TabsTrigger
              value="categories"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Package className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">ประเภททรัพย์สิน</span>
              <span className="sm:hidden">ประเภท</span>
            </TabsTrigger>
            <TabsTrigger
              value="feedback"
              className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm py-2 sm:py-2.5 transition-all duration-200 hover:scale-105 active:scale-95"
            >
              <Star className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">ความพึงพอใจ</span>
              <span className="sm:hidden">รีวิว</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: สถิติการแจ้งซ่อม */}
          <TabsContent
            value="tickets"
            className="space-y-3 sm:space-y-4 mt-6 sm:mt-0 animate-in fade-in slide-in-from-bottom-4 duration-300"
          >
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
              <Card className="overflow-hidden">
                <CardHeader className="pb-2 px-3 sm:px-6 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                    ทั้งหมด
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-8 relative">
                  <div className="text-2xl sm:text-3xl md:text-4xl text-right">
                    {ticketStats.total}
                  </div>
                  <p className="text-xs text-muted-foreground absolute bottom-3 right-3">รายการ</p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <CardHeader className="pb-2 px-3 sm:px-6 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                    รอดำเนินการ
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-8 relative">
                  <div className="text-2xl sm:text-3xl md:text-4xl text-orange-600 text-right">
                    {ticketStats.pending}
                  </div>
                  <p className="text-xs text-muted-foreground absolute bottom-3 right-3">
                    {ticketStats.total > 0
                      ? (
                          (ticketStats.pending / ticketStats.total) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <CardHeader className="pb-2 px-3 sm:px-6 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                    กำลังดำเนินการ
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-8 relative">
                  <div className="text-2xl sm:text-3xl md:text-4xl text-blue-600 text-right">
                    {ticketStats.inProgress}
                  </div>
                  <p className="text-xs text-muted-foreground absolute bottom-3 right-3">
                    {ticketStats.total > 0
                      ? (
                          (ticketStats.inProgress / ticketStats.total) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <CardHeader className="pb-2 px-3 sm:px-6 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                    เสร็จสิ้น
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-8 relative">
                  <div className="text-2xl sm:text-3xl md:text-4xl text-green-600 text-right">
                    {ticketStats.completed}
                  </div>
                  <p className="text-xs text-muted-foreground absolute bottom-3 right-3">
                    {ticketStats.total > 0
                      ? (
                          (ticketStats.completed / ticketStats.total) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                </CardContent>
              </Card>
              <Card className="overflow-hidden">
                <CardHeader className="pb-2 px-3 sm:px-6 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                    ยกเลิก
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-8 relative">
                  <div className="text-2xl sm:text-3xl md:text-4xl text-red-600 text-right">
                    {ticketStats.cancelled}
                  </div>
                  <p className="text-xs text-muted-foreground absolute bottom-3 right-3">
                    {ticketStats.total > 0
                      ? (
                          (ticketStats.cancelled / ticketStats.total) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                </CardContent>
              </Card>
              <Card
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setIsCostDialogOpen(true)}
              >
                <CardHeader className="pb-2 px-3 sm:px-6 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                    ค่าใช้จ่ายรวม
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-8 relative">
                  <div className="text-2xl sm:text-3xl md:text-4xl text-amber-600 text-right">
                    {ticketStats.totalCost.toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}{" "}
                    บาท
                  </div>
                  <p className="text-xs text-blue-600 absolute bottom-3 right-3">
                    คลิกเพื่อดูรายละเอียด
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg">
                  การกระจายของสถานะงาน
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-3 sm:space-y-4">
                  {[
                    {
                      label: "รอดำเนินการ",
                      count: ticketStats.pending,
                      color: "bg-orange-500",
                    },
                    {
                      label: "กำลังดำเนินการ",
                      count: ticketStats.inProgress,
                      color: "bg-blue-500",
                    },
                    {
                      label: "รอการประเมิน",
                      count: ticketStats.waitingReview,
                      color: "bg-purple-500",
                    },
                    {
                      label: "เสร็จสิ้น",
                      count: ticketStats.completed,
                      color: "bg-green-500",
                    },
                    {
                      label: "ยกเลิก",
                      count: ticketStats.cancelled,
                      color: "bg-red-500",
                    },
                  ].map((item) => {
                    const percentage =
                      ticketStats.total > 0
                        ? (item.count / ticketStats.total) * 100
                        : 0;
                    return (
                      <div
                        key={item.label}
                        className="space-y-1.5 sm:space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs sm:text-sm">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <span className="font-medium">{item.label}</span>
                            <span className="text-muted-foreground">
                              ({item.count})
                            </span>
                          </div>
                          <span className="font-medium">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                          <div
                            className={`${item.color} h-2 sm:h-2.5 rounded-full transition-all duration-300`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              <Card>
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="text-base sm:text-lg">
                    ประเภทของงาน
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 sm:px-6">
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-blue-500 rounded"></div>
                          <span className="font-medium text-sm">
                            เบิกอุปกรณ์
                          </span>
                        </div>
                        <span className="text-xl font-bold text-blue-600">
                          {ticketStats.requestCount}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-lg h-32 flex items-end">
                        <div
                          className="bg-blue-500 rounded-lg transition-all duration-500 w-full flex items-center justify-center text-white font-bold text-sm"
                          style={{
                            height:
                              ticketStats.total > 0
                                ? `${
                                    (ticketStats.requestCount /
                                      ticketStats.total) *
                                    100
                                  }%`
                                : "0%",
                            minHeight:
                              ticketStats.requestCount > 0 ? "30px" : "0px",
                          }}
                        >
                          {ticketStats.total > 0
                            ? `${(
                                (ticketStats.requestCount / ticketStats.total) *
                                100
                              ).toFixed(1)}%`
                            : ""}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-green-500 rounded"></div>
                          <span className="font-medium text-sm">แจ้งซ่อม</span>
                        </div>
                        <span className="text-xl font-bold text-green-600">
                          {ticketStats.repairCount}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-lg h-32 flex items-end">
                        <div
                          className="bg-green-500 rounded-lg transition-all duration-500 w-full flex items-center justify-center text-white font-bold text-sm"
                          style={{
                            height:
                              ticketStats.total > 0
                                ? `${
                                    (ticketStats.repairCount /
                                      ticketStats.total) *
                                    100
                                  }%`
                                : "0%",
                            minHeight:
                              ticketStats.repairCount > 0 ? "30px" : "0px",
                          }}
                        >
                          {ticketStats.total > 0
                            ? `${(
                                (ticketStats.repairCount / ticketStats.total) *
                                100
                              ).toFixed(1)}%`
                            : ""}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>รายการงานยอดนิยม</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(workStats)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([work, count], index) => {
                        const maxCount = Math.max(...Object.values(workStats));
                        const percentage =
                          maxCount > 0 ? (count / maxCount) * 100 : 0;
                        return (
                          <div key={work} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="font-medium text-muted-foreground flex-shrink-0">
                                  #{index + 1}
                                </span>
                                <span
                                  className="font-medium truncate"
                                  title={work}
                                >
                                  {work}
                                </span>
                              </div>
                              <span className="font-bold text-blue-600 ml-2 flex-shrink-0">
                                {count} ครั้ง
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-6 flex items-center">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-blue-600 h-6 rounded-full flex items-center justify-end px-2 transition-all duration-500"
                                style={{
                                  width: `${percentage}%`,
                                  minWidth: count > 0 ? "40px" : "0px",
                                }}
                              >
                                <span className="text-white text-xs font-bold">
                                  {percentage.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    {Object.keys(workStats).length === 0 && (
                      <div className="text-center text-muted-foreground py-8 text-sm">
                        ยังไม่มีข้อมูลรายการงาน
                      </div>
                    )}
                  </div>
                  {Object.keys(workStats).length > 5 && (
                    <Button
                      variant="outline"
                      className="w-full mt-3"
                      size="sm"
                      onClick={() => setIsWorkDialogOpen(true)}
                    >
                      ดูทั้งหมด ({Object.keys(workStats).length} รายการ)
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>ผู้แจ้งบ่อยที่สุด</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(userStats)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([username, count], index) => {
                        const maxCount = Math.max(...Object.values(userStats));
                        const percentage =
                          maxCount > 0 ? (count / maxCount) * 100 : 0;
                        return (
                          <div key={username} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="font-medium text-muted-foreground shrink-0">
                                  #{index + 1}
                                </span>
                                <span
                                  className="font-medium truncate"
                                  title={username}
                                >
                                  {username}
                                </span>
                              </div>
                              <span className="font-bold text-green-600 ml-2 shrink-0">
                                {count} ครั้ง
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-6 flex items-center">
                              <div
                                className="bg-gradient-to-r from-green-500 to-green-600 h-6 rounded-full flex items-center justify-end px-2 transition-all duration-500"
                                style={{
                                  width: `${percentage}%`,
                                  minWidth: count > 0 ? "40px" : "0px",
                                }}
                              >
                                <span className="text-white text-xs font-bold">
                                  {percentage.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    {Object.keys(userStats).length === 0 && (
                      <div className="text-center text-muted-foreground py-8 text-sm">
                        ยังไม่มีข้อมูลผู้แจ้ง
                      </div>
                    )}
                  </div>
                  {Object.keys(userStats).length > 5 && (
                    <Button
                      variant="outline"
                      className="w-full mt-3"
                      size="sm"
                      onClick={() => setIsUserDialogOpen(true)}
                    >
                      ดูทั้งหมด ({Object.keys(userStats).length} คน)
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ทรัพย์สินที่ซ่อมบ่อยที่สุด</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {Object.entries(assetStats)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 5)
                      .map(([assetId, count], index) => {
                        const maxCount = Math.max(...Object.values(assetStats));
                        const percentage =
                          maxCount > 0 ? (count / maxCount) * 100 : 0;
                        return (
                          <div key={assetId} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2 flex-1 min-w-0">
                                <span className="font-medium text-muted-foreground shrink-0">
                                  #{index + 1}
                                </span>
                                <span
                                  className="font-medium truncate"
                                  title={assetId}
                                >
                                  {assetId}
                                </span>
                              </div>
                              <span className="font-bold text-orange-600 ml-2 shrink-0">
                                {count} ครั้ง
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-6 flex items-center">
                              <div
                                className="bg-gradient-to-r from-orange-500 to-orange-600 h-6 rounded-full flex items-center justify-end px-2 transition-all duration-500"
                                style={{
                                  width: `${percentage}%`,
                                  minWidth: count > 0 ? "40px" : "0px",
                                }}
                              >
                                <span className="text-white text-xs font-bold">
                                  {percentage.toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    {Object.keys(assetStats).length === 0 && (
                      <div className="text-center text-muted-foreground py-8 text-sm">
                        ยังไม่มีข้อมูลทรัพย์สิน
                      </div>
                    )}
                  </div>
                  {Object.keys(assetStats).length > 5 && (
                    <Button
                      variant="outline"
                      className="w-full mt-3"
                      size="sm"
                      onClick={() => setIsAssetDialogOpen(true)}
                    >
                      ดูทั้งหมด ({Object.keys(assetStats).length} รายการ)
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>ประวัติการแจ้งซ่อมทั้งหมด</CardTitle>
              </CardHeader>
              <CardContent>
                {/* Search and Filter */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ค้นหา เลขที่คำขอ, ผู้แจ้ง, รายการ..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="pl-10"
                    />
                  </div>
                  <Select
                    value={statusFilter}
                    onValueChange={(value) => {
                      setStatusFilter(value);
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="กรองสถานะ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทุกสถานะ</SelectItem>
                      <SelectItem value="0">รอดำเนินการ</SelectItem>
                      <SelectItem value="1">กำลังดำเนินการ</SelectItem>
                      <SelectItem value="2">เสร็จสิ้น</SelectItem>
                      <SelectItem value="3">ยกเลิก</SelectItem>
                      <SelectItem value="4">รอการประเมิน</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(value) => {
                      setItemsPerPage(Number(value));
                      setCurrentPage(1);
                    }}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 รายการ</SelectItem>
                      <SelectItem value="20">20 รายการ</SelectItem>
                      <SelectItem value="30">30 รายการ</SelectItem>
                      <SelectItem value="40">40 รายการ</SelectItem>
                      <SelectItem value="50">50 รายการ</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">ลำดับ</TableHead>
                        <TableHead>เลขที่คำขอ</TableHead>
                        <TableHead>ผู้แจ้ง</TableHead>
                        <TableHead>รายการ</TableHead>
                        <TableHead>ประเภท</TableHead>
                        <TableHead>สถานะ</TableHead>
                        <TableHead className="text-right">วันที่แจ้ง</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentTickets.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center text-muted-foreground py-8"
                          >
                            {searchQuery || statusFilter !== "all"
                              ? "ไม่พบข้อมูลที่ค้นหา"
                              : "ยังไม่มีข้อมูลการแจ้งซ่อม"}
                          </TableCell>
                        </TableRow>
                      ) : (
                        currentTickets.map((ticket, index) => (
                          <TableRow key={ticket.request_id}>
                            <TableCell className="font-medium">
                              {startIndex + index + 1}
                            </TableCell>
                            <TableCell className="font-mono">
                              {ticket.request_id}
                            </TableCell>
                            <TableCell>{ticket.username}</TableCell>
                            <TableCell className="max-w-xs truncate">
                              {ticket.work || ticket.problem_description || "-"}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">
                                {ticket.form_type === "request"
                                  ? "เบิกอุปกรณ์"
                                  : "แจ้งซ่อม"}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(ticket.Status)}
                            </TableCell>
                            <TableCell className="text-right text-sm">
                              {new Date(ticket.created_at).toLocaleDateString(
                                "th-TH",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    แสดง {startIndex + 1} -{" "}
                    {Math.min(endIndex, filteredTickets.length)} จาก{" "}
                    {filteredTickets.length} รายการ
                    {tickets.length !== filteredTickets.length &&
                      ` (กรองจากทั้งหมด ${tickets.length} รายการ)`}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      ก่อนหน้า
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter((page) => {
                          return (
                            page === 1 ||
                            page === totalPages ||
                            (page >= currentPage - 1 && page <= currentPage + 1)
                          );
                        })
                        .map((page, index, array) => (
                          <div key={page} className="flex items-center">
                            {index > 0 && array[index - 1] !== page - 1 && (
                              <span className="px-2">...</span>
                            )}
                            <Button
                              variant={
                                currentPage === page ? "default" : "outline"
                              }
                              size="sm"
                              onClick={() => setCurrentPage(page)}
                              className="min-w-[40px]"
                            >
                              {page}
                            </Button>
                          </div>
                        ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages || totalPages === 0}
                    >
                      ถัดไป
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 2: สถิติทรัพย์สินตามบริษัท */}
          <TabsContent
            value="sites"
            className="space-y-3 sm:space-y-4 mt-6 sm:mt-0 animate-in fade-in slide-in-from-bottom-4 duration-300"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {Object.entries(companyStats)
                .sort((a, b) => b[1] - a[1])
                .map(([company, count]) => {
                  const total = Object.values(companyStats).reduce(
                    (a, b) => a + b,
                    0
                  );
                  const percentage = total > 0 ? (count / total) * 100 : 0;
                  return (
                    <Card
                      key={company}
                      className="cursor-pointer hover:shadow-lg transition-shadow hover:border-blue-500 overflow-hidden"
                      onClick={() => handleCompanyClick(company)}
                    >
                      <CardHeader className="pb-2 px-4 sm:px-6 sm:pb-3">
                        <div className="flex items-center justify-between">
                          <Building2 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                          <Badge variant="secondary" className="text-sm sm:text-base">
                            {percentage.toFixed(1)}%
                          </Badge>
                        </div>
                        <CardTitle className="text-lg sm:text-xl md:text-2xl mt-2 truncate">
                          {getCompanyName(company) || "ไม่ระบุบริษัท"}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="px-4 sm:px-6">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm sm:text-base text-muted-foreground">
                              จำนวนทรัพย์สิน
                            </span>
                            <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-blue-600">
                              {count}
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-muted-foreground text-center mt-2">
                            คลิกเพื่อดูรายละเอียด
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              {Object.keys(companyStats).length === 0 && (
                <div className="col-span-full text-center text-muted-foreground py-8">
                  ยังไม่มีข้อมูลทรัพย์สิน
                </div>
              )}
            </div>

            {/* สถิติประเภททรัพย์สิน */}
            <Card className="mt-6">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg">
                  จำนวนทรัพย์สินแยกตามประเภท
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-3 sm:space-y-4">
                  {Object.entries(categoryStats)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, count]) => {
                      const total = Object.values(categoryStats).reduce(
                        (a, b) => a + b,
                        0
                      );
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      return (
                        <div
                          key={category}
                          className="space-y-1.5 sm:space-y-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                          onClick={() => handleCategoryClick(category)}
                        >
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <span className="font-medium">
                                {category || "ไม่ระบุประเภท"}
                              </span>
                              <span className="text-muted-foreground">
                                ({count} รายการ)
                              </span>
                            </div>
                            <span className="font-medium">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                            <div
                              className="bg-purple-500 h-2 sm:h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  {Object.keys(categoryStats).length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      ยังไม่มีข้อมูลทรัพย์สิน
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 3: สถิติประเภททรัพย์สิน */}
          <TabsContent
            value="categories"
            className="space-y-3 sm:space-y-4 mt-6 sm:mt-0 animate-in fade-in slide-in-from-bottom-4 duration-300"
          >
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="text-base sm:text-lg">
                  จำนวนทรัพย์สินแยกตามประเภท
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="space-y-3 sm:space-y-4">
                  {Object.entries(categoryStats)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, count]) => {
                      const total = Object.values(categoryStats).reduce(
                        (a, b) => a + b,
                        0
                      );
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      return (
                        <div
                          key={category}
                          className="space-y-1.5 sm:space-y-2 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors"
                          onClick={() => handleCategoryClick(category)}
                        >
                          <div className="flex items-center justify-between text-xs sm:text-sm">
                            <div className="flex items-center gap-1.5 sm:gap-2">
                              <span className="font-medium">
                                {category || "ไม่ระบุประเภท"}
                              </span>
                              <span className="text-muted-foreground">
                                ({count} รายการ)
                              </span>
                            </div>
                            <span className="font-medium">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2 sm:h-2.5">
                            <div
                              className="bg-purple-500 h-2 sm:h-2.5 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  {Object.keys(categoryStats).length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      ยังไม่มีข้อมูลทรัพย์สิน
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab 4: รายงานผลการประเมินความพึงพอใจ */}
          <TabsContent
            value="feedback"
            className="space-y-3 sm:space-y-4 mt-6 sm:mt-0 animate-in fade-in slide-in-from-bottom-4 duration-300"
          >
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2 sm:gap-4">
              <Card className="overflow-hidden">
                <CardHeader className="pb-2 px-3 sm:px-6 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                    จำนวนการประเมินทั้งหมด
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-8 relative">
                  <div className="text-2xl sm:text-3xl md:text-4xl text-right">
                    {feedbackStats.total}
                  </div>
                  <p className="text-xs text-muted-foreground absolute bottom-3 right-3">รายการ</p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader className="pb-2 px-3 sm:px-6 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                    คะแนนเฉลี่ย
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-8 relative">
                  <div className="text-2xl sm:text-3xl md:text-4xl text-blue-600 text-right">
                    {feedbackStats.avgRating}
                  </div>
                  <p className="text-xs text-muted-foreground absolute bottom-3 right-3">
                    จาก 5 คะแนน
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader className="pb-2 px-3 sm:px-6 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                    พึงพอใจมากที่สุด
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-8 relative">
                  <div className="text-2xl sm:text-3xl md:text-4xl text-green-600 text-right">
                    {feedbackStats.excellent}
                  </div>
                  <p className="text-xs text-muted-foreground absolute bottom-3 right-3">
                    {feedbackStats.total > 0
                      ? (
                          (feedbackStats.excellent / feedbackStats.total) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                </CardContent>
              </Card>

              <Card className="overflow-hidden">
                <CardHeader className="pb-2 px-3 sm:px-6 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground truncate">
                    ไม่พึงพอใจ
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 pb-8 relative">
                  <div className="text-2xl sm:text-3xl md:text-4xl text-red-600 text-right">
                    {feedbackStats.bad}
                  </div>
                  <p className="text-xs text-muted-foreground absolute bottom-3 right-3">
                    {feedbackStats.total > 0
                      ? (
                          (feedbackStats.bad / feedbackStats.total) *
                          100
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>การกระจายของคะแนนประเมิน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      rating: 5,
                      label: "พึงพอใจมากที่สุด",
                      count: feedbackStats.excellent,
                      color: "bg-green-500",
                    },
                    {
                      rating: 4,
                      label: "พึงพอใจมาก",
                      count: feedbackStats.good,
                      color: "bg-blue-500",
                    },
                    {
                      rating: 3,
                      label: "พึงพอใจปานกลาง",
                      count: feedbackStats.fair,
                      color: "bg-yellow-500",
                    },
                    {
                      rating: 2,
                      label: "พึงพอใจน้อย",
                      count: feedbackStats.poor,
                      color: "bg-orange-500",
                    },
                    {
                      rating: 1,
                      label: "ไม่พึงพอใจ",
                      count: feedbackStats.bad,
                      color: "bg-red-500",
                    },
                  ].map((item) => {
                    const percentage =
                      feedbackStats.total > 0
                        ? (item.count / feedbackStats.total) * 100
                        : 0;
                    return (
                      <div key={item.rating} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.label}</span>
                            <span className="text-muted-foreground">
                              ({item.count})
                            </span>
                          </div>
                          <span className="font-medium">
                            {percentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className={`${item.color} h-2.5 rounded-full`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* การประเมินตามผู้รับซ่อม */}
            {Object.keys(technicianRatings).length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>การประเมินตามผู้รับซ่อม</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    ดูประสิทธิภาพการทำงานของแต่ละช่าง
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {Object.entries(technicianRatings)
                      .sort((a, b) => b[1].avgRating - a[1].avgRating)
                      .map(([technician, stats]) => (
                        <div key={technician} className="space-y-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                <span className="text-blue-700 font-bold text-lg">
                                  {technician.charAt(0).toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg">{technician}</h3>
                                <p className="text-sm text-muted-foreground">
                                  ประเมิน {stats.total} ครั้ง
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center gap-2">
                                <span className="text-3xl font-bold text-blue-600">
                                  {stats.avgRating}
                                </span>
                                <div className="flex flex-col">
                                  <div className="flex gap-0.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                      <span
                                        key={star}
                                        className={`text-sm ${
                                          stats.avgRating >= star
                                            ? "text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                      >
                                        ★
                                      </span>
                                    ))}
                                  </div>
                                  <span className="text-xs text-muted-foreground">
                                    จาก 5 คะแนน
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-5 gap-2 text-center">
                            <div className="space-y-1">
                              <div className="text-green-600 font-bold text-xl">
                                {stats.excellent}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ★★★★★
                              </div>
                              <div className="text-xs text-green-600 font-medium">
                                {stats.total > 0 ? ((stats.excellent / stats.total) * 100).toFixed(0) : 0}%
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-blue-600 font-bold text-xl">
                                {stats.good}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ★★★★☆
                              </div>
                              <div className="text-xs text-blue-600 font-medium">
                                {stats.total > 0 ? ((stats.good / stats.total) * 100).toFixed(0) : 0}%
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-yellow-600 font-bold text-xl">
                                {stats.fair}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ★★★☆☆
                              </div>
                              <div className="text-xs text-yellow-600 font-medium">
                                {stats.total > 0 ? ((stats.fair / stats.total) * 100).toFixed(0) : 0}%
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-orange-600 font-bold text-xl">
                                {stats.poor}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ★★☆☆☆
                              </div>
                              <div className="text-xs text-orange-600 font-medium">
                                {stats.total > 0 ? ((stats.poor / stats.total) * 100).toFixed(0) : 0}%
                              </div>
                            </div>
                            <div className="space-y-1">
                              <div className="text-red-600 font-bold text-xl">
                                {stats.bad}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                ★☆☆☆☆
                              </div>
                              <div className="text-xs text-red-600 font-medium">
                                {stats.total > 0 ? ((stats.bad / stats.total) * 100).toFixed(0) : 0}%
                              </div>
                            </div>
                          </div>

                          {/* Progress bar แสดงสัดส่วน */}
                          <div className="w-full h-3 bg-gray-200 rounded-full flex overflow-hidden">
                            {stats.excellent > 0 && (
                              <div
                                className="bg-green-500"
                                style={{ width: `${(stats.excellent / stats.total) * 100}%` }}
                                title={`5 ดาว: ${stats.excellent}`}
                              />
                            )}
                            {stats.good > 0 && (
                              <div
                                className="bg-blue-500"
                                style={{ width: `${(stats.good / stats.total) * 100}%` }}
                                title={`4 ดาว: ${stats.good}`}
                              />
                            )}
                            {stats.fair > 0 && (
                              <div
                                className="bg-yellow-500"
                                style={{ width: `${(stats.fair / stats.total) * 100}%` }}
                                title={`3 ดาว: ${stats.fair}`}
                              />
                            )}
                            {stats.poor > 0 && (
                              <div
                                className="bg-orange-500"
                                style={{ width: `${(stats.poor / stats.total) * 100}%` }}
                                title={`2 ดาว: ${stats.poor}`}
                              />
                            )}
                            {stats.bad > 0 && (
                              <div
                                className="bg-red-500"
                                style={{ width: `${(stats.bad / stats.total) * 100}%` }}
                                title={`1 ดาว: ${stats.bad}`}
                              />
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>รายละเอียดการประเมินทั้งหมด</CardTitle>
                  <Select value={ratingFilter} onValueChange={setRatingFilter}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="กรองตามดาว" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                      <SelectItem value="5">★★★★★ (5 ดาว)</SelectItem>
                      <SelectItem value="4">★★★★☆ (4 ดาว)</SelectItem>
                      <SelectItem value="3">★★★☆☆ (3 ดาว)</SelectItem>
                      <SelectItem value="2">★★☆☆☆ (2 ดาว)</SelectItem>
                      <SelectItem value="1">★☆☆☆☆ (1 ดาว)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                <FeedbackDataTable 
                  data={feedbacks}
                  onRowClick={handleTicketClick}
                  ratingFilter={ratingFilter}
                />
              </CardContent>
            </Card>

            {/* Ticket Detail Dialog */}
            <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>รายละเอียดการแจ้งซ่อม - {selectedTicket?.request_id}</DialogTitle>
                </DialogHeader>
                {selectedTicket && (
                  <div className="space-y-4 py-4">
                    <div className="space-y-3">
                      <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                        <p className="text-sm font-semibold text-muted-foreground mb-1">ผู้รับงาน</p>
                        <p className="text-lg font-bold text-purple-700">
                          {selectedTicket.finish_with || '-'}
                        </p>
                      </div>

                      <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                        <p className="text-sm font-semibold text-muted-foreground mb-1">ระยะเวลาการซ่อม</p>
                        <p className="text-lg font-bold text-orange-700">
                          {(() => {
                            const startDate = selectedTicket.start_repair && selectedTicket.start_repair.trim() !== '' 
                              ? new Date(selectedTicket.start_repair)
                              : selectedTicket.created_at ? new Date(selectedTicket.created_at) : null
                            
                            if (!startDate) return '-'
                            
                            const endDate = selectedTicket.finish_repair && selectedTicket.finish_repair.trim() !== '' 
                              ? new Date(selectedTicket.finish_repair) 
                              : (selectedTicket.Status === 2 ? null : new Date())
                            
                            if (!endDate) return '-'
                            
                            const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
                            
                            return `${diffDays} วัน`
                          })()}
                        </p>
                      </div>
                    </div>

                    <Button
                      onClick={() => setIsTicketDialogOpen(false)}
                      className="w-full"
                    >
                      ปิด
                    </Button>
                  </div>
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialog รายการงานทั้งหมด */}
      <Dialog open={isWorkDialogOpen} onOpenChange={setIsWorkDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>รายการงานยอดนิยมทั้งหมด</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {Object.entries(workStats)
              .sort((a, b) => b[1] - a[1])
              .map(([work, count], index) => {
                const maxCount = Math.max(...Object.values(workStats));
                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div key={work} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="font-medium text-muted-foreground shrink-0">
                          #{index + 1}
                        </span>
                        <span className="font-medium truncate" title={work}>
                          {work}
                        </span>
                      </div>
                      <span className="font-bold text-blue-600 ml-2 shrink-0">
                        {count} ครั้ง
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6 flex items-center">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-6 rounded-full flex items-center justify-end px-2 transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          minWidth: count > 0 ? "40px" : "0px",
                        }}
                      >
                        <span className="text-white text-xs font-bold">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog ผู้แจ้งทั้งหมด */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ผู้แจ้งบ่อยที่สุดทั้งหมด</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {Object.entries(userStats)
              .sort((a, b) => b[1] - a[1])
              .map(([username, count], index) => {
                const maxCount = Math.max(...Object.values(userStats));
                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div key={username} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="font-medium text-muted-foreground shrink-0">
                          #{index + 1}
                        </span>
                        <span className="font-medium truncate" title={username}>
                          {username}
                        </span>
                      </div>
                      <span className="font-bold text-green-600 ml-2 shrink-0">
                        {count} ครั้ง
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6 flex items-center">
                      <div
                        className="bg-gradient-to-r from-green-500 to-green-600 h-6 rounded-full flex items-center justify-end px-2 transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          minWidth: count > 0 ? "40px" : "0px",
                        }}
                      >
                        <span className="text-white text-xs font-bold">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog ค่าใช้จ่ายทั้งหมด */}
      {/* <Dialog open={isCostDialogOpen} onOpenChange={setIsCostDialogOpen}>
        <DialogContent className="max-w-[100vw] max-h-[95vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>รายการที่มีค่าใช้จ่าย</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">ค่าใช้จ่ายรวมทั้งหมด</p>
                  <p className="text-2xl font-bold text-amber-600">
                    ฿{ticketStats.totalCost.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">จำนวนรายการ</p>
                  <p className="text-xl font-bold text-gray-700">
                    {filterTicketsByDate(tickets).filter((t: Ticket) => t.cost && t.cost.trim() !== '').length} รายการ
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">ลำดับ</TableHead>
                    <TableHead className="w-[150px]">เลขที่คำขอ</TableHead>
                    <TableHead className="w-[200px]">ผู้แจ้ง</TableHead>
                    <TableHead className="w-[250px]">รายการ</TableHead>
                    <TableHead className="text-right w-[150px]">ค่าใช้จ่าย</TableHead>
                    <TableHead className="text-right w-[150px]">วันที่</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filterTicketsByDate(tickets)
                    .filter((t: Ticket) => t.cost && t.cost.trim() !== '')
                    .sort((a, b) => {
                      const costA = parseFloat(a.cost?.replace(/[,฿]/g, '') || '0')
                      const costB = parseFloat(b.cost?.replace(/[,฿]/g, '') || '0')
                      return costB - costA
                    })
                    .map((ticket, index) => {
                      const costNumber = parseFloat(ticket.cost?.replace(/[,฿]/g, '') || '0')
                      return (
                        <TableRow key={ticket.request_id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell className="font-mono text-sm">{ticket.request_id}</TableCell>
                          <TableCell className="text-sm">{ticket.username}</TableCell>
                          <TableCell className="text-sm">
                            {ticket.work || ticket.problem_description || '-'}
                          </TableCell>
                          <TableCell className="text-right font-semibold text-amber-600">
                            ฿{costNumber.toLocaleString('th-TH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {new Date(ticket.created_at).toLocaleDateString('th-TH', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  {filterTicketsByDate(tickets).filter((t: Ticket) => t.cost && t.cost.trim() !== '').length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        ไม่มีรายการที่มีค่าใช้จ่าย
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog> */}
      <Dialog open={isCostDialogOpen} onOpenChange={setIsCostDialogOpen}>
        <DialogContent
          className="
      !w-[72vw]
      !max-w-none
      max-h-[95vh]
      overflow-auto
      p-6
    "
        >
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              รายการที่มีค่าใช้จ่าย
            </DialogTitle>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Date Filter */}
            <div className="flex gap-2 items-center flex-wrap">
              <Select value={costDialogDateFilter} onValueChange={setCostDialogDateFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="เลือกช่วงเวลา" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="today">วันนี้</SelectItem>
                  <SelectItem value="week">สัปดาห์นี้</SelectItem>
                  <SelectItem value="month">เดือนนี้</SelectItem>
                  <SelectItem value="year">ปีนี้</SelectItem>
                  <SelectItem value="custom">กำหนดเอง</SelectItem>
                </SelectContent>
              </Select>

              {costDialogDateFilter === "custom" && (
                <>
                  <Input
                    type="date"
                    value={costDialogCustomStartDate}
                    onChange={(e) => setCostDialogCustomStartDate(e.target.value)}
                    className="w-[180px]"
                    placeholder="วันที่เริ่มต้น"
                  />
                  <span className="text-muted-foreground">ถึง</span>
                  <Input
                    type="date"
                    value={costDialogCustomEndDate}
                    onChange={(e) => setCostDialogCustomEndDate(e.target.value)}
                    className="w-[180px]"
                    placeholder="วันที่สิ้นสุด"
                  />
                </>
              )}
            </div>
            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-1  gap-4">
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-muted-foreground mb-1">
                  ค่าใช้จ่ายรวมทั้งหมด
                </p>
                <p className="text-2xl font-bold text-amber-600">
                  ฿{(() => {
                    const filteredTickets = filterTicketsByDateForDialog(tickets);
                    const total = filteredTickets
                      .filter((t: Ticket) => t.cost && t.cost.trim() !== "")
                      .reduce((sum, ticket) => {
                        const cost = parseFloat(ticket.cost?.replace(/[,฿]/g, "") || "0");
                        return sum + cost;
                      }, 0);
                    return total.toLocaleString("th-TH", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    });
                  })()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {filterTicketsByDateForDialog(tickets).filter(
                    (t: Ticket) => t.cost && t.cost.trim() !== ""
                  ).length}{" "}
                  รายการ
                </p>
              </div>

              {/* <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-muted-foreground mb-1">
                  สรุปรายเดือน (ตามช่วงวันที่ที่เลือก)
                </p>
                {(() => {
                  const costByMonth: { [key: string]: number } = {};
                  filterTicketsByDateForDialog(tickets)
                    .filter((t: Ticket) => t.cost && t.cost.trim() !== "")
                    .forEach((ticket) => {
                      const date = new Date(ticket.created_at);
                      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                      const cost = parseFloat(ticket.cost?.replace(/[,฿]/g, "") || "0");
                      costByMonth[monthKey] = (costByMonth[monthKey] || 0) + cost;
                    });
                  
                  const monthsCount = Object.keys(costByMonth).length;
                  const totalCost = Object.values(costByMonth).reduce((sum, cost) => sum + cost, 0);
                  
                  if (monthsCount === 0) {
                    return <p className="text-lg font-bold text-blue-600">฿0.00</p>;
                  }
                  
                  return (
                    <>
                      <p className="text-2xl font-bold text-blue-600">
                        ฿{totalCost.toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{monthsCount} เดือน</p>
                    </>
                  );
                })()}
              </div> */}
{/* 
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="text-sm text-muted-foreground mb-1">
                  สรุปรายปี (ตามช่วงวันที่ที่เลือก)
                </p>
                {(() => {
                  const costByYear: { [key: string]: number } = {};
                  filterTicketsByDateForDialog(tickets)
                    .filter((t: Ticket) => t.cost && t.cost.trim() !== "")
                    .forEach((ticket) => {
                      const year = new Date(ticket.created_at).getFullYear().toString();
                      const cost = parseFloat(ticket.cost?.replace(/[,฿]/g, "") || "0");
                      costByYear[year] = (costByYear[year] || 0) + cost;
                    });
                  
                  const yearsCount = Object.keys(costByYear).length;
                  const totalCost = Object.values(costByYear).reduce((sum, cost) => sum + cost, 0);
                  
                  if (yearsCount === 0) {
                    return <p className="text-lg font-bold text-green-600">฿0.00</p>;
                  }
                  
                  return (
                    <>
                      <p className="text-2xl font-bold text-green-600">
                        ฿{totalCost.toLocaleString("th-TH", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{yearsCount} ปี</p>
                    </>
                  );
                })()}
              </div> */}
            </div>

            {/* Table */}
            <div className="rounded-md border overflow-x-auto">
              <Table className="min-w-[1200px]">
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow>
                    <TableHead className="w-[80px] whitespace-nowrap">
                      ลำดับ
                    </TableHead>
                    <TableHead className="w-[150px] whitespace-nowrap">
                      เลขที่คำขอ
                    </TableHead>
                    <TableHead className="w-[220px] whitespace-nowrap">
                      ผู้แจ้ง
                    </TableHead>
                    <TableHead className="min-w-[300px]">รายการ</TableHead>
                    <TableHead className="w-[160px] text-right whitespace-nowrap">
                      ค่าใช้จ่าย
                    </TableHead>
                    <TableHead className="w-[160px] text-right whitespace-nowrap">
                      วันที่
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filterTicketsByDateForDialog(tickets)
                    .filter((t: Ticket) => t.cost && t.cost.trim() !== "")
                    .sort((a, b) => {
                      const costA = parseFloat(
                        a.cost?.replace(/[,฿]/g, "") || "0"
                      );
                      const costB = parseFloat(
                        b.cost?.replace(/[,฿]/g, "") || "0"
                      );
                      return costB - costA;
                    })
                    .map((ticket, index) => {
                      const costNumber = parseFloat(
                        ticket.cost?.replace(/[,฿]/g, "") || "0"
                      );

                      return (
                        <TableRow key={ticket.request_id}>
                          <TableCell className="font-medium">
                            {index + 1}
                          </TableCell>

                          <TableCell className="font-mono text-sm">
                            {ticket.request_id}
                          </TableCell>

                          <TableCell className="text-sm whitespace-nowrap">
                            {ticket.username}
                          </TableCell>

                          <TableCell className="text-sm">
                            {ticket.work || ticket.problem_description || "-"}
                          </TableCell>

                          <TableCell className="text-right font-semibold text-amber-600">
                            ฿
                            {costNumber.toLocaleString("th-TH", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </TableCell>

                          <TableCell className="text-right text-sm text-muted-foreground whitespace-nowrap">
                            {new Date(ticket.created_at).toLocaleDateString(
                              "th-TH",
                              {
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}

                  {/* Empty state */}
                  {filterTicketsByDate(tickets).filter(
                    (t: Ticket) => t.cost && t.cost.trim() !== ""
                  ).length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-muted-foreground py-10"
                      >
                        ไม่มีรายการที่มีค่าใช้จ่าย
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog ทรัพย์สินทั้งหมด */}
      <Dialog open={isAssetDialogOpen} onOpenChange={setIsAssetDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ทรัพย์สินที่ซ่อมบ่อยที่สุดทั้งหมด</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {Object.entries(assetStats)
              .sort((a, b) => b[1] - a[1])
              .map(([assetId, count], index) => {
                const maxCount = Math.max(...Object.values(assetStats));
                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div key={assetId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <span className="font-medium text-muted-foreground shrink-0">
                          #{index + 1}
                        </span>
                        <span className="font-medium truncate" title={assetId}>
                          {assetId}
                        </span>
                      </div>
                      <span className="font-bold text-orange-600 ml-2 shrink-0">
                        {count} ครั้ง
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-6 flex items-center">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-orange-600 h-6 rounded-full flex items-center justify-end px-2 transition-all duration-500"
                        style={{
                          width: `${percentage}%`,
                          minWidth: count > 0 ? "40px" : "0px",
                        }}
                      >
                        <span className="text-white text-xs font-bold">
                          {percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog แสดงรายละเอียดทรัพย์สินตามประเภท */}
      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="!max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-500" />
              รายละเอียดทรัพย์สิน - {selectedCategory || "ไม่ระบุประเภท"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    ทรัพย์สินทั้งหมด
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {categoryAssets.length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">รายการ</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    สาขาที่มีทรัพย์สินนี้
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {new Set(categoryAssets.map(a => a.site).filter(Boolean)).size}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">สาขา</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>รายการทรัพย์สิน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[80px]">ลำดับ</TableHead>
                        <TableHead>รหัสทรัพย์สิน</TableHead>
                        <TableHead>ชื่ออุปกรณ์</TableHead>
                        <TableHead>สาขา</TableHead>
                        <TableHead>แผนก</TableHead>
                        <TableHead>ผู้ใช้งาน</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categoryAssets.length > 0 ? (
                        categoryAssets.map((asset, index) => (
                          <TableRow key={asset.asset_code || index}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell className="font-mono text-sm">{asset.asset_code || '-'}</TableCell>
                            <TableCell className="text-sm">{asset.device_name || '-'}</TableCell>
                            <TableCell className="text-sm">{asset.site || '-'}</TableCell>
                            <TableCell className="text-sm">{asset.department || '-'}</TableCell>
                            <TableCell className="text-sm">{asset.user_name || '-'}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            ไม่มีข้อมูลทรัพย์สิน
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog แสดงรายละเอียดทรัพย์สินของบริษัท */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              รายละเอียดทรัพย์สิน - {selectedCompany ? getCompanyName(selectedCompany) : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-3 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    ทรัพย์สินทั้งหมด
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">
                    {selectedCompany ? companyStats[selectedCompany] : 0}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">รายการ</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    จำนวนสาขา
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {Object.keys(companySiteStats).length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">สาขา</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    ประเภททรัพย์สิน
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {Object.keys(companyDetailStats).length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">ประเภท</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>แยกตามสาขา</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(companySiteStats)
                    .sort((a, b) => b[1] - a[1])
                    .map(([site, count]) => {
                      const total = Object.values(companySiteStats).reduce(
                        (a, b) => a + b,
                        0
                      );
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      return (
                        <div 
                          key={site} 
                          className="space-y-2 cursor-pointer hover:bg-accent p-3 rounded-lg transition-colors"
                          onClick={() => handleSiteClick(site, selectedCompany || '')}
                        >
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-green-500" />
                              <span className="font-medium">
                                {site || "ไม่ระบุสาขา"}
                              </span>
                              <span className="text-muted-foreground">
                                ({count} รายการ)
                              </span>
                            </div>
                            <span className="font-medium">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  {Object.keys(companySiteStats).length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      ไม่มีข้อมูลสาขา
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>แยกตามประเภททรัพย์สิน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(companyDetailStats)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, count]) => {
                      const total = Object.values(companyDetailStats).reduce(
                        (a, b) => a + b,
                        0
                      );
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-purple-500" />
                              <span className="font-medium">
                                {category || "ไม่ระบุประเภท"}
                              </span>
                              <span className="text-muted-foreground">
                                ({count} รายการ)
                              </span>
                            </div>
                            <span className="font-medium">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2.5 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  {Object.keys(companyDetailStats).length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      ไม่มีข้อมูลประเภททรัพย์สิน
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog แสดงรายละเอียดทรัพย์สินของสาขา */}
      <Dialog open={isSiteDialogOpen} onOpenChange={setIsSiteDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-green-500" />
              รายละเอียดทรัพย์สิน - {selectedCompany ? getCompanyName(selectedCompany) : ''} / {selectedSite}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    ทรัพย์สินทั้งหมด
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {Object.values(siteDetailStats).reduce((a, b) => a + b, 0)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">รายการ</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    ประเภททรัพย์สิน
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {Object.keys(siteDetailStats).length}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">ประเภท</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>แยกตามประเภททรัพย์สิน</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(siteDetailStats)
                    .sort((a, b) => b[1] - a[1])
                    .map(([category, count]) => {
                      const total = Object.values(siteDetailStats).reduce(
                        (a, b) => a + b,
                        0
                      );
                      const percentage = total > 0 ? (count / total) * 100 : 0;
                      return (
                        <div key={category} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Package className="h-4 w-4 text-purple-500" />
                              <span className="font-medium">
                                {category || "ไม่ระบุประเภท"}
                              </span>
                              <span className="text-muted-foreground">
                                ({count} รายการ)
                              </span>
                            </div>
                            <span className="font-medium">
                              {percentage.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2.5 rounded-full transition-all"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                  {Object.keys(siteDetailStats).length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      ไม่มีข้อมูลประเภททรัพย์สิน
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
