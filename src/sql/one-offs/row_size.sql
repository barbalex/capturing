SELECT
  id,
  octet_length(t.*::text) AS bytes
FROM
  pvl_geoms t;

