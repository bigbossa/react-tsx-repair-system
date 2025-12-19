"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CompanyDialog } from "@/components/company-dialog";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Search,
  Building2,
} from "lucide-react";
import Swal from "sweetalert2";

interface Site {
  id: number;
  site_code: string;
  site: string;
  created_at?: string;
  updated_at?: string;
}

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

export default function SitesPage() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [sites, setSites] = useState<Site[]>([]);
  const [filteredSites, setFilteredSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // Company states
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [companySearchQuery, setCompanySearchQuery] = useState("");
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    if (!user) return;

    if (user.role !== "admin") {
      router.push("/dashboard");
      return;
    }
    fetchSites();
    fetchCompanies();
  }, [user]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = sites.filter(
        (site) =>
          site.site_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          site.site.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSites(filtered);
    } else {
      setFilteredSites(sites);
    }
  }, [searchTerm, sites]);

  useEffect(() => {
    if (companySearchQuery.trim() === "") {
      setFilteredCompanies(companies);
    } else {
      const query = companySearchQuery.toLowerCase();
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
  }, [companySearchQuery, companies]);

  const fetchSites = async () => {
    try {
      const response = await fetch("/api/sites");
      const data = await response.json();
      if (data.success) {
        setSites(data.data);
        setFilteredSites(data.data);
      }
    } catch (error) {
      console.error("Error fetching sites:", error);
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถโหลดข้อมูลสาขาได้",
        icon: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch("/api/company");
      if (response.ok) {
        const data = await response.json();
        setCompanies(data);
        setFilteredCompanies(data);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  const handleAddCompany = () => {
    setSelectedCompany(null);
    setIsCompanyDialogOpen(true);
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setIsCompanyDialogOpen(true);
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
        const response = await fetch(`/api/company?id=${company.id}`, {
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

  const handleAddSite = async () => {
    const { value: formValues } = await Swal.fire({
      title: "เพิ่มสาขาใหม่",
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">รหัสสาขา *</label>
            <input id="site_code" class="swal2-input" placeholder="เช่น Y11" style="width: 100%; margin: 0;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">ชื่อสาขา *</label>
            <input id="site_name" class="swal2-input" placeholder="เช่น ทรัพยากรบุคคลย้ำ" style="width: 100%; margin: 0;">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "เพิ่ม",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#3085d6",
      preConfirm: () => {
        const site_code = (
          document.getElementById("site_code") as HTMLInputElement
        ).value;
        const site_name = (
          document.getElementById("site_name") as HTMLInputElement
        ).value;

        if (!site_code || !site_name) {
          Swal.showValidationMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
          return false;
        }

        return { site_code, site_name };
      },
    });

    if (formValues) {
      try {
        const response = await fetch("/api/sites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            site_code: formValues.site_code,
            site: formValues.site_name,
          }),
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            title: "สำเร็จ!",
            text: "เพิ่มสาขาเรียบร้อยแล้ว",
            icon: "success",
          });
          fetchSites();
        } else {
          Swal.fire({
            title: "เกิดข้อผิดพลาด",
            text: data.error || "ไม่สามารถเพิ่มสาขาได้",
            icon: "error",
          });
        }
      } catch (error) {
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถเพิ่มสาขาได้",
          icon: "error",
        });
      }
    }
  };

  const handleEditSite = async (site: Site) => {
    const { value: formValues } = await Swal.fire({
      title: "แก้ไขสาขา",
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">รหัสสาขา *</label>
            <input id="site_code" class="swal2-input" value="${site.site_code}" style="width: 100%; margin: 0;">
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">ชื่อสาขา *</label>
            <input id="site_name" class="swal2-input" value="${site.site}" style="width: 100%; margin: 0;">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "บันทึก",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#3085d6",
      preConfirm: () => {
        const site_code = (
          document.getElementById("site_code") as HTMLInputElement
        ).value;
        const site_name = (
          document.getElementById("site_name") as HTMLInputElement
        ).value;

        if (!site_code || !site_name) {
          Swal.showValidationMessage("กรุณากรอกข้อมูลให้ครบถ้วน");
          return false;
        }

        return { site_code, site_name };
      },
    });

    if (formValues) {
      try {
        const response = await fetch(`/api/sites/${site.site_code}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            site_code: formValues.site_code,
            site: formValues.site_name,
          }),
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            title: "สำเร็จ!",
            text: "แก้ไขสาขาเรียบร้อยแล้ว",
            icon: "success",
          });
          fetchSites();
        } else {
          Swal.fire({
            title: "เกิดข้อผิดพลาด",
            text: data.error || "ไม่สามารถแก้ไขสาขาได้",
            icon: "error",
          });
        }
      } catch (error) {
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถแก้ไขสาขาได้",
          icon: "error",
        });
      }
    }
  };

  const handleDeleteSite = async (site: Site) => {
    const result = await Swal.fire({
      title: "ยืนยันการลบ",
      html: `คุณต้องการลบสาขา <strong>${site.site_code} - ${site.site}</strong> ใช่หรือไม่?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ลบ",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      try {
        const response = await fetch(`/api/sites/${site.site_code}`, {
          method: "DELETE",
        });

        const data = await response.json();

        if (data.success) {
          Swal.fire({
            title: "สำเร็จ!",
            text: "ลบสาขาเรียบร้อยแล้ว",
            icon: "success",
          });
          fetchSites();
        } else {
          Swal.fire({
            title: "เกิดข้อผิดพลาด",
            text: data.error || "ไม่สามารถลบสาขาได้",
            icon: "error",
          });
        }
      } catch (error) {
        Swal.fire({
          title: "เกิดข้อผิดพลาด",
          text: "ไม่สามารถลบสาขาได้",
          icon: "error",
        });
      }
    }
  };

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header Navbar */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/dashboard")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-xl lg:text-2xl font-bold truncate">
                ตั้งค่าระบบ
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                Admin Dashboard
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4 shrink-0">
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <div className="text-right hidden sm:block">
                <p className="font-medium text-sm">
                  {user?.name || user?.username}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role}
                </p>
              </div>
              <span className="text-sm sm:hidden">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Tabs defaultValue="sites" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="sites">จัดการสาขา</TabsTrigger>
            <TabsTrigger value="company">จัดการบริษัท</TabsTrigger>
          </TabsList>

          {/* Sites Tab */}
          <TabsContent value="sites">
            {/* Page Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold">จัดการสาขา</h1>
                <p className="text-sm text-gray-600 mt-1">
                  จัดการข้อมูลสาขาในองค์กร - ทั้งหมด {sites.length} สาขา
                </p>
              </div>
              <Button onClick={handleAddSite} className="gap-2">
                <Plus className="h-4 w-4" />
                เพิ่มสาขา
              </Button>
            </div>

            {/* Search */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="ค้นหา รหัสสาขา, ชื่อสาขา..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Table */}
            <Card>
              <CardContent className="pt-6">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          รหัสสาขา
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          ชื่อสาขา
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider">
                          จัดการ
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredSites.length === 0 ? (
                        <tr>
                          <td
                            colSpan={3}
                            className="px-6 py-8 text-center text-gray-500"
                          >
                            {searchTerm
                              ? "ไม่พบข้อมูลที่ค้นหา"
                              : "ไม่มีข้อมูลสาขา"}
                          </td>
                        </tr>
                      ) : (
                        filteredSites.map((site) => (
                          <tr
                            key={site.id}
                            className="hover:bg-muted/50 transition-colors"
                          >
                            <td className="px-4 py-4 whitespace-nowrap">
                              <Badge
                                variant="outline"
                                className="bg-blue-50 text-blue-700 border-blue-300"
                              >
                                {site.site_code}
                              </Badge>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium">
                                {site.site}
                              </div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-center">
                              <div className="flex justify-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEditSite(site)}
                                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDeleteSite(site)}
                                  className="border-red-300 text-red-700 hover:bg-red-50"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
            <h1 className="text-2xl sm:text-3xl font-bold">จัดการบริษัท</h1>
                            <p className="text-sm text-gray-600 mb-4">
                  จัดการข้อมูลนบริษัท - ทั้งหมด {companies.length} บริษัท
                </p>
          {/* Company Tab */}
          <TabsContent value="company">
            {/* Stats Card */}
            {/* <Card className="mb-6">
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
            </Card> */}

            {/* Search and Add Button */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="ค้นหาบริษัท..."
                      value={companySearchQuery}
                      onChange={(e) => setCompanySearchQuery(e.target.value)}
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
                {filteredCompanies.length === 0 ? (
                  <div className="text-center py-8">
                    <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      {companySearchQuery
                        ? "ไม่พบบริษัทที่ค้นหา"
                        : "ยังไม่มีบริษัทในระบบ"}
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
                          <th className="text-center p-4 font-semibold">
                            จัดการ
                          </th>
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Company Dialog */}
      <CompanyDialog
        open={isCompanyDialogOpen}
        onOpenChange={setIsCompanyDialogOpen}
        company={selectedCompany}
        onSuccess={fetchCompanies}
      />
    </div>
  );
}
