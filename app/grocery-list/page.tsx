import { getGroceryItems } from "@/lib/actions/grocery"
import { GroceryListClient } from "./GroceryListClient"

export default async function GroceryListPage() {
  const items = await getGroceryItems()
  return <GroceryListClient items={items} />
}

