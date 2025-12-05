-- Add ingredients column to meals table for grocery list generation
ALTER TABLE meals 
ADD COLUMN IF NOT EXISTS ingredients TEXT[];

-- Add a comment explaining the column
COMMENT ON COLUMN meals.ingredients IS 'Array of ingredient strings with quantities for grocery list generation';

-- Add source column to grocery_lists to track where items came from
ALTER TABLE grocery_lists
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'meal', 'forecast'));

-- Add meal_id reference to link grocery items to specific meals
ALTER TABLE grocery_lists
ADD COLUMN IF NOT EXISTS meal_id UUID REFERENCES meals(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_grocery_lists_source ON grocery_lists(source);
CREATE INDEX IF NOT EXISTS idx_grocery_lists_meal_id ON grocery_lists(meal_id);

