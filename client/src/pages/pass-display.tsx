import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { QRCodeSVG } from "qrcode.react";
import { Printer, Download, ArrowLeft, Shield, Calendar, User, CreditCard, FileText } from "lucide-react";
import { useLocation } from "wouter";
import type { Transaction, Pass } from "@shared/schema";

const PASS_TYPE_LABELS: Record<string, string> = {
  daily: "Daily Pass",
  vehicle: "Vehicle Sticker",
  crane: "Crane Lorry Vehicle Sticker Pass",
};

export default function PassDisplay() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const transactionId = params.transactionId;

  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/passes/transaction/${transactionId}`],
    enabled: !!transactionId,
  });

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-red-600 dark:text-red-400">
                {error ? "Error loading passes" : "Transaction not found"}
              </p>
              <Button onClick={() => setLocation("/")} className="mt-4">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Pass Management
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { transaction, passes } = data as { transaction: Transaction; passes: Pass[] };

  const handlePrint = () => {
    window.print();
  };

  const formatCurrency = (amount: string) => `MVR ${parseFloat(amount).toFixed(2)}`;

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      {/* Header */}
      <div className="mb-8 no-print">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Pass Display
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Transaction ID: {transaction.id}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setLocation("/")} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <Button onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-2" />
              Print Passes
            </Button>
          </div>
        </div>
      </div>

      {/* Transaction Summary */}
      <Card className="mb-8 no-print">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Transaction Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Payer Name</p>
              <p className="font-medium">{transaction.payerName}</p>
            </div>
            {transaction.payerEmail && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                <p className="font-medium">{transaction.payerEmail}</p>
              </div>
            )}
            {transaction.payerPhone && (
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                <p className="font-medium">{transaction.payerPhone}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Amount</p>
              <p className="font-bold text-lg text-green-600 dark:text-green-400">
                {formatCurrency(transaction.totalAmount)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Passes */}
      <div className="grid gap-6 print:gap-4">
        {passes.map((pass, index) => (
          <Card key={pass.id} className="print:break-inside-avoid print:page-break-inside-avoid">
            <CardHeader className="text-center bg-blue-50 dark:bg-blue-900/20 print:bg-gray-50">
              <div className="flex justify-center mb-4">
                <Shield className="h-12 w-12 text-blue-600 dark:text-blue-400" />
              </div>
              <CardTitle className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                MALDIVES PORT AUTHORITY
              </CardTitle>
              <p className="text-blue-700 dark:text-blue-300 font-medium">
                {PASS_TYPE_LABELS[pass.passType]}
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid gap-6 md:grid-cols-2 print:grid-cols-2">
                {/* Pass Information */}
                <div className="space-y-4">
                  <div className="text-center">
                    <Badge variant="outline" className="text-lg px-4 py-2 font-mono">
                      {pass.passNumber}
                    </Badge>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Customer Name</p>
                        <p className="font-semibold">{pass.customerName}</p>
                      </div>
                    </div>

                    {pass.idNumber && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">ID Number</p>
                          <p className="font-semibold">{pass.idNumber}</p>
                        </div>
                      </div>
                    )}

                    {pass.plateNumber && (
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-600" />
                        <div>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Plate Number</p>
                          <p className="font-semibold">{pass.plateNumber}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-600" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Valid Date</p>
                        <p className="font-semibold">{pass.validDate}</p>
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-200 dark:border-green-800">
                      <p className="text-sm text-green-700 dark:text-green-300">Amount Paid</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(pass.amount)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center justify-center">
                  <div className="bg-white p-4 rounded-lg border-2 border-gray-300 print:border-black">
                    <img 
                      src={pass.qrCode} 
                      alt={`QR Code for ${pass.passNumber}`}
                      className="w-32 h-32 print:w-24 print:h-24"
                    />
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 text-center">
                    Scan for verification
                  </p>
                </div>
              </div>

              {/* Footer */}
              <Separator className="my-6" />
              <div className="text-center text-xs text-gray-600 dark:text-gray-400 print:text-black">
                <p className="mb-1">
                  Created: {new Date(pass.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p>
                  This is an official digital pass issued by Maldives Port Authority
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          .print\\:break-inside-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          .print\\:page-break-inside-avoid {
            page-break-inside: avoid;
          }
          
          .print\\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          
          .print\\:w-24 {
            width: 6rem;
          }
          
          .print\\:h-24 {
            height: 6rem;
          }
          
          .print\\:bg-gray-50 {
            background-color: #f9fafb;
          }
          
          .print\\:border-black {
            border-color: #000000;
          }
          
          .print\\:text-black {
            color: #000000;
          }
          
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
}