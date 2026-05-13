import re

with open('apps/web/app/(staff)/manager/page.tsx', 'r') as f:
    content = f.read()

if "import { Button }" not in content:
    content = content.replace(
        "import { LanguageSwitcher } from '@/components/language-switcher';",
        "import { LanguageSwitcher } from '@/components/language-switcher';\nimport { Button } from '@/components/ui/button';\nimport { Input } from '@/components/ui/input';"
    )

content = content.replace(
    """<Select value={bookingStatusFilter} onValueChange={(val) => { setBookingStatusFilter(val); setBookingPage(0); }}>
                    <SelectTrigger className="w-40">
                      <div className="flex items-center gap-2">
                        <FilterIcon className="h-4 w-4" />
                        <span>Status</span>
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Statuses</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>""",
    """<select 
                    className="w-40 h-10 px-3 py-2 border rounded-md text-sm bg-white"
                    value={bookingStatusFilter} 
                    onChange={(e) => { setBookingStatusFilter(e.target.value); setBookingPage(0); }}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="PENDING">Pending</option>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>"""
)

content = content.replace("<Table>", "<table className=\"w-full text-sm text-left\">")
content = content.replace("</Table>", "</table>")
content = content.replace("<TableHeader>", "<thead className=\"text-xs text-gray-700 uppercase bg-gray-50 border-b\">")
content = content.replace("</TableHeader>", "</thead>")
content = content.replace("<TableRow className=\"bg-gray-50/50\">", "<tr>")
content = content.replace("<TableRow key={booking.id} className=\"hover:bg-gray-50 transition-colors\">", "<tr key={booking.id} className=\"border-b hover:bg-gray-50 transition-colors\">")
content = content.replace("<TableRow>", "<tr>")
content = content.replace("</TableRow>", "</tr>")
content = content.replace("<TableBody>", "<tbody>")
content = content.replace("</TableBody>", "</tbody>")

content = content.replace("<TableHead>", "<th className=\"px-6 py-3 font-medium\">")
content = content.replace("<TableHead className=\"text-right\">", "<th className=\"px-6 py-3 font-medium text-right\">")
content = content.replace("</TableHead>", "</th>")

content = content.replace("<TableCell>", "<td className=\"px-6 py-4\">")
content = content.replace("<TableCell className=\"text-right\">", "<td className=\"px-6 py-4 text-right\">")
content = content.replace("<TableCell colSpan={5} className=\"text-center py-8 text-gray-500\">", "<td colSpan={5} className=\"px-6 py-8 text-center text-gray-500\">")
content = content.replace("</TableCell>", "</td>")

with open('apps/web/app/(staff)/manager/page.tsx', 'w') as f:
    f.write(content)
