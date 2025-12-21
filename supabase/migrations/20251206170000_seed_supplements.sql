-- Seed baseline supplements including Vital Flow so the Nutrition and Tools pages can render recommendations.
BEGIN;

INSERT INTO public.supplements (
  name,
  category,
  description,
  benefits,
  recommended_dosage,
  recommended_time,
  featured,
  product_url
)
VALUES
  (
    'VitalFlow',
    'Testosterone Support',
    'World''s First TRT Dissolvable - Natural Testosterone Support Drink Mix. Lemonade-flavored packets formulated with clinically-studied ingredients including L-Arginine, D-Aspartic Acid, Ashwagandha, Vitamin D3, Zinc, and Magnesium to support optimal hormone levels and male vitality.',
    ARRAY[
      'Improve Sex Life - Better libido and performance',
      'Boost Your Mood - Feel confident and positive',
      'Increase Energy - Wake up refreshed, stay energized all day',
      'Boost Focus - Enhanced clarity and decision-making',
      'Recover Faster - Support muscle growth and recovery',
      'Vitality Benefits - Feel in your prime again'
    ],
    '1 packet mixed with water',
    'Daily',
    true,
    'https://vitalflowofficial.com/products/vitalflow-natural-testosterone-support-drink-mix'
  ),
  (
    'Protein Powder',
    'Muscle Building',
    'High-quality whey protein to fuel muscle growth and recovery after intense workouts',
    ARRAY[
      'Supports muscle growth',
      'Aids recovery',
      'Convenient protein source'
    ],
    '1 scoop',
    'Post-workout',
    false,
    '#'
  ),
  (
    'Creatine',
    'Performance',
    'Proven supplement for increasing strength, power output, and lean muscle mass',
    ARRAY[
      'Increase power output',
      'Improve strength',
      'Support lean mass'
    ],
    '5g',
    'Pre- or post-workout',
    false,
    '#'
  ),
  (
    'Fish Oil',
    'Recovery',
    'Omega-3 rich fish oil to support heart health and reduce inflammation from training',
    ARRAY[
      'Support heart health',
      'Reduce inflammation',
      'Aid recovery'
    ],
    '2 softgels',
    'With meals',
    false,
    '#'
  )
ON CONFLICT (name) DO UPDATE SET
  category = EXCLUDED.category,
  description = EXCLUDED.description,
  benefits = EXCLUDED.benefits,
  recommended_dosage = EXCLUDED.recommended_dosage,
  recommended_time = EXCLUDED.recommended_time,
  featured = EXCLUDED.featured,
  product_url = EXCLUDED.product_url;

COMMIT;

