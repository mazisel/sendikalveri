-- Adds the official union file number without changing source_id.
-- source_id is the sendikadata API id and is still needed for detail/history endpoints.

ALTER TABLE public.unions
ADD COLUMN IF NOT EXISTS file_number INT;

CREATE INDEX IF NOT EXISTS unions_type_file_number_idx
ON public.unions (type, file_number)
WHERE file_number IS NOT NULL;

-- Ulaştırma hizmet kolu examples. sendikadata API ids are different from official file numbers.
WITH official_file_numbers(source_id, type, file_number) AS (
  VALUES
    (445, 'civil'::public.union_type, 11),
    (447, 'civil'::public.union_type, 85),
    (448, 'civil'::public.union_type, 129),
    (449, 'civil'::public.union_type, 146),
    (450, 'civil'::public.union_type, 176),
    (451, 'civil'::public.union_type, 285),
    (452, 'civil'::public.union_type, 297),
    (453, 'civil'::public.union_type, 340),
    (673, 'civil'::public.union_type, 424),
    (674, 'civil'::public.union_type, 425),
    (703, 'civil'::public.union_type, 435),
    (704, 'civil'::public.union_type, 436),
    (758, 'civil'::public.union_type, 482)
)
UPDATE public.unions AS unions
SET file_number = official_file_numbers.file_number
FROM official_file_numbers
WHERE unions.source_id = official_file_numbers.source_id
  AND unions.type = official_file_numbers.type;
