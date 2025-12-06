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
    'Vital Flow',
    'Testosterone Support',
    'Premium testosterone booster formulated with natural ingredients to optimize hormone levels and maximize fitness results',
    ARRAY[
      'Naturally boost testosterone levels',
      'Enhance muscle growth and recovery',
      'Improve energy and vitality',
      'Support healthy hormone balance'
    ],
    '2 capsules',
    'Morning',
    true,
    '#'
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

