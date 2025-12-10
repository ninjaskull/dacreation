import { AdminLayout } from "@/components/admin/layout";
import { Card, CardContent } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <AdminLayout title={title} description={description}>
      <Card className="mt-8">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <Construction className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">Coming Soon</h2>
          <p className="text-muted-foreground text-center max-w-md">
            This feature is under development. Check back soon for updates!
          </p>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}

export function InquiriesPage() {
  return <PlaceholderPage title="Inquiries" description="Manage customer inquiries" />;
}

export function BookingsPage() {
  return <PlaceholderPage title="Bookings" description="Manage event bookings" />;
}

export function VenuesPage() {
  return <PlaceholderPage title="Venues" description="Manage venue partnerships" />;
}

export function TeamPage() {
  return <PlaceholderPage title="Team" description="Manage your team members" />;
}

export function TasksPage() {
  return <PlaceholderPage title="Tasks" description="Manage tasks and to-dos" />;
}

export function HelpPage() {
  return <PlaceholderPage title="Help & Support" description="Get help and support" />;
}
