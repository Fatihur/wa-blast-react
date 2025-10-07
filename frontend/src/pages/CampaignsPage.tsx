import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

export default function CampaignsPage() {
  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await api.get('/campaigns');
      return response.data;
    }
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Kampanye</h1>

      <Card>
        <CardHeader>
          <CardTitle>Riwayat Kampanye</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Memuat kampanye...</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Kampanye</TableHead>
                  <TableHead>Total Terkirim</TableHead>
                  <TableHead>Berhasil</TableHead>
                  <TableHead>Gagal</TableHead>
                  <TableHead>Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns?.map((campaign: any) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">{campaign.name}</TableCell>
                    <TableCell>{campaign.totalSent}</TableCell>
                    <TableCell className="text-green-600">{campaign.totalSuccess}</TableCell>
                    <TableCell className="text-red-600">{campaign.totalFailed}</TableCell>
                    <TableCell>{format(new Date(campaign.createdAt), 'PPp')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
