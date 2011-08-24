# Création d'une table articles à partir des restes de l'analyse

CREATE TABLE articles AS
SELECT DISTINCT wos_id as id, 
(SELECT data FROM ISIPubdate WHERE id = articles2terms.wos_id) as date,
(SELECT data FROM baseLanguage WHERE id = articles2terms.wos_id) as lang,
(SELECT data FROM byline WHERE id = articles2terms.wos_id) as author,
(SELECT data FROM sourceName WHERE id = articles2terms.wos_id) as source,
(SELECT data FROM headline WHERE id = articles2terms.wos_id) as title,
(SELECT data FROM leadParagraph WHERE id = articles2terms.wos_id) as abstract
FROM articles2terms;

# De l'optimisation pour les champions

CREATE UNIQUE INDEX articles_id_idx ON articles(id);

CREATE INDEX clusters_univ_id_idx ON clusters(cluster_univ_id);
CREATE INDEX pos_cam_univ_id_idx ON positions_metrolines_cam(cluster_univ_id);
CREATE INDEX phylo_current_cluster_univ_id ON phylogeny(current_cluster_univ_id);
CREATE INDEX phylo_previous_cluster_univ_id ON phylogeny(previous_cluster_univ_id);

CREATE INDEX clusters_stream_id_idx ON clusters(stream_id);

CREATE INDEX clusters_period_idx ON clusters(period);
