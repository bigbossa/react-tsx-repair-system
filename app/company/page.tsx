"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-context";
import { apiFetch } from '@/lib/api';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { CompanyDialog } from "@/components/company-dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Pencil, Trash2, Building2 } from "lucide-react";
import Swal from "sweetalert2";

interface Company {
  id: number;
  company_code: string;
  company_name: string;
  address?: string;
  phone?: string;
  email?: string;
  created_at: string;
  updated_at: string;
}

export default function CompanyPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "admin") {
      router.push("/dashboard");
      return;
    }

    fetchCompanies();
  }, [user, authLoading, router]);

  useEffect(() => {
    // Filter companies based on search query
    if (searchQuery.trim() === "") {
      setFilteredCompanies(companies);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = companies.filter(
        (company) =>
          company.company_code.toLowerCase().includes(query) ||
          company.company_name.toLowerCase().includes(query) ||
          company.address?.toLowerCase().includes(query) ||
          company.phone?.includes(query) ||
          company.email?.toLowerCase().includes(query)
      );
      setFilteredCompanies(filtered);
    }
  }, [searchQuery, companies]);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const response = await apiFetch("/api/company");
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
        setFilteredCompanies(data);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
      await Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลได้",
        confirmButtonText: "ตกลง",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCompany = () => {
    setSelectedCompany(null);
    setIsDialogOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setIsDialogOpen(true);
  };

  const handleDeleteCompany = async (company: Company) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "ยืนยันการลบ",
      text: `คุณต้องการลบบริษัท "${company.company_name}" ใช่หรือไม่?`,
      showCancelButton: true,
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
    });

    if (result.isConfirmed) {
      try {
        const response = await apiFetch(`/api/company?id=${company.id}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (response.ok) {
          await Swal.fire({
            icon: "success",
            title: "ลบสำเร็จ",
            text: data.message,
            timer: 1000,
            showConfirmButton: false,
          });
          fetchCompanies();
        } else {
          await Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: data.error || "ไม่สามารถลบข้อมูลได้",
            confirmButtonText: "ตกลง",
          });
        }
      } catch (error) {
        console.error("Error deleting company:", error);
        await Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้",
          confirmButtonText: "ตกลง",
        });
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  if (authLoading || (isLoading && companies.length === 0)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Navigation */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
              className="shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-xl lg:text-2xl font-bold truncate">
                จัดการข้อมูลบริษัท
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                Admin Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <div className="text-right hidden sm:block">
                <p className="font-medium text-sm">{user.username}</p>
                <p className="text-xs text-muted-foreground">{user.name}</p>
              </div>
              <span className="text-sm sm:hidden">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {/* Stats Card */}
        <Card className="mb-6">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              จำนวนบริษัททั้งหมด
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {companies.length}
            </div>
            <p className="text-xs text-muted-foreground">บริษัท</p>
          </CardContent>
        </Card>

        {/* Search and Add Button */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาบริษัท..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button
                onClick={handleAddCompany}
                className="bg-black text-white hover:bg-gray-800"
              >
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มบริษัท
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Companies Table */}
        <Card>
          <CardContent className="pt-6">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-muted-foreground">กำลังโหลดข้อมูล...</p>
              </div>
            ) : filteredCompanies.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchQuery ? "ไม่พบบริษัทที่ค้นหา" : "ยังไม่มีบริษัทในระบบ"}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-semibold">รหัส</th>
                      <th className="text-left p-4 font-semibold">
                        ชื่อบริษัท
                      </th>
                      <th className="text-center p-4 font-semibold">จัดการ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCompanies.map((company) => (
                      <tr
                        key={company.id}
                        className="border-b hover:bg-muted/50 transition-colors"
                      >
                        <td className="p-4">
                          <Badge
                            variant="outline"
                            className="bg-blue-50 text-blue-700 border-blue-300"
                          >
                            {company.company_code}
                          </Badge>
                        </td>
                        <td className="p-4 font-medium">
                          {company.company_name}
                        </td>

                        <td className="p-4">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCompany(company)}
                              className="border-blue-300 text-blue-700 hover:bg-blue-50"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteCompany(company)}
                              className="border-red-300 text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Company Dialog */}
      <CompanyDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        company={selectedCompany}
        onSuccess={fetchCompanies}
      />
    </div>
  );
}
