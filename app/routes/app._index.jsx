import { useLoaderData } from "@remix-run/react";
import { Card, Page, Layout } from "@shopify/polaris";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export const loader = async () => {
  const orders = await prisma.partialPayment.findMany({ orderBy: { createdAt: 'desc' }});
  return { orders };
};

export default function Dashboard() {
  const { orders } = useLoaderData();

  return (
    <Page title="COD Partial Payments">
      <Layout>
        <Layout.Section>
          <Card title="Recent COD Orders" sectioned>
            {orders.length === 0 ? (
              <p>No COD orders yet.</p>
            ) : (
              orders.map(order => (
                <div key={order.id}>
                  #{order.orderId} — ₹{(order.amount / 100).toFixed(2)} — {order.status}
                </div>
              ))
            )}
          </Card>
        </Layout.Section>
      </Layout>
    </Page>
  );
}