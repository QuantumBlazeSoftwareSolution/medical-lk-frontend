'use client';

import React from 'react';
import {
  ClipboardList,
  Search,
  FileText,
  Calendar,
  Sparkles,
  CheckCircle2,
  User,
} from 'lucide-react';

export default function PrescriptionsRegistry() {
  const mockPrescriptions = [
    {
      id: '1',
      rxNumber: 'RX-84920',
      patient: 'Kamal Silva',
      doctor: 'Dr. A. B. Perera',
      date: 'Wednesday, 10 June 2026',
      status: 'Dispensed',
    },
    {
      id: '2',
      rxNumber: 'RX-84919',
      patient: 'Sunil Perera',
      doctor: 'Dr. S. K. Alwis',
      date: 'Tuesday, 9 June 2026',
      status: 'Dispensed',
    },
    {
      id: '3',
      rxNumber: 'RX-84918',
      patient: 'Ruwan Silva',
      doctor: 'Dr. A. B. Perera',
      date: 'Monday, 8 June 2026',
      status: 'Pending Review',
    },
  ];

  return (
    <div className="max-w-[1200px] mx-auto space-y-6 select-none font-sans">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-[#191c1e] flex items-center gap-2">
          <ClipboardList className="text-[#0f3d57] h-6 w-6" /> Prescriptions
          Registry
        </h1>
        <p className="text-sm text-[#42474d] mt-1">
          Review, approve, and track patient prescription orders.
        </p>
      </div>

      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search prescriptions by Rx number, patient name, or doctor..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#eceef1] rounded-xl focus:outline-none focus:border-[#0f3d57] focus:ring-1 focus:ring-[#0f3d57] text-sm text-[#191c1e] placeholder:text-[#42474d]/50"
        />
        <Search className="absolute left-3.5 top-3 h-4.5 w-4.5 text-[#42474d]/50" />
      </div>

      {/* Prescriptions Table */}
      <div className="bg-white border border-[#eceef1] rounded-xl p-6 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f2f4f7] text-[#42474d] text-[11px] font-semibold uppercase tracking-wider border-b border-[#eceef1]">
                <th className="p-4 font-medium">Rx Number</th>
                <th className="p-4 font-medium">Patient</th>
                <th className="p-4 font-medium">Doctor / Prescriber</th>
                <th className="p-4 font-medium">Date Received</th>
                <th className="p-4 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm divide-y divide-[#eceef1] text-[#191c1e]">
              {mockPrescriptions.map((rx) => (
                <tr
                  key={rx.id}
                  className="hover:bg-[#f2f4f7]/50 transition-colors"
                >
                  <td className="p-4 font-semibold text-[#0f3d57]">
                    {rx.rxNumber}
                  </td>
                  <td className="p-4">
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4 text-[#42474d]/70" />{' '}
                      {rx.patient}
                    </span>
                  </td>
                  <td className="p-4">{rx.doctor}</td>
                  <td className="p-4 text-[#42474d]">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-[#42474d]/50" />{' '}
                      {rx.date}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        rx.status === 'Dispensed'
                          ? 'bg-[#6bfe9c]/30 text-[#00743a]'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {rx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
