<?php
declare(strict_types=1);

/** Standalone PHP adapter for Hostinger cron / a future Laravel command.
 * It uses the same public source and JSON contract as the GitHub synchronizer.
 * No Instagram credentials, database connection or Python runtime are needed.
 */
final class ARInstagramSync
{
    public const ACCOUNT = 'kayak_parana_club';
    public const SOURCE = 'https://www.instagram.com/kayak_parana_club/embed/';

    private static function fetch(string $url, bool $image = false): string
    {
        $host = parse_url($url, PHP_URL_HOST) ?: '';
        $allowed = $image
            ? (str_ends_with($host, '.cdninstagram.com') || str_ends_with($host, '.fbcdn.net'))
            : $host === 'www.instagram.com';
        if (parse_url($url, PHP_URL_SCHEME) !== 'https' || !$allowed) {
            throw new RuntimeException('Origen de Instagram no permitido');
        }
        $body = '';
        if (function_exists('curl_init')) {
            $curl = curl_init($url);
            curl_setopt_array($curl, [
                CURLOPT_FOLLOWLOCATION => false,
                CURLOPT_CONNECTTIMEOUT => 10,
                CURLOPT_TIMEOUT => 25,
                CURLOPT_SSL_VERIFYPEER => true,
                CURLOPT_SSL_VERIFYHOST => 2,
                CURLOPT_USERAGENT => 'ARemarlaWebsiteSync/1.0',
                CURLOPT_HTTPHEADER => ['Accept-Language: es-AR,es;q=0.9,en;q=0.8'],
                CURLOPT_WRITEFUNCTION => static function ($handle, string $chunk) use (&$body): int {
                    if (strlen($body) + strlen($chunk) > 10 * 1024 * 1024) return 0;
                    $body .= $chunk;
                    return strlen($chunk);
                },
            ]);
            $ok = curl_exec($curl);
            $status = curl_getinfo($curl, CURLINFO_RESPONSE_CODE);
            curl_close($curl);
            if ($ok === false || $status !== 200) {
                throw new RuntimeException('Instagram no entregó una respuesta pública válida');
            }
        } else {
            $context = stream_context_create(['http' => [
                'timeout' => 25, 'follow_location' => 0,
                'user_agent' => 'ARemarlaWebsiteSync/1.0',
                'header' => "Accept-Language: es-AR,es;q=0.9,en;q=0.8\r\n",
            ], 'ssl' => ['verify_peer' => true, 'verify_peer_name' => true]]);
            $stream = @fopen($url, 'rb', false, $context);
            if ($stream === false) throw new RuntimeException('No se pudo leer Instagram');
            $metadata = stream_get_meta_data($stream);
            $status = $metadata['wrapper_data'][0] ?? '';
            $body = stream_get_contents($stream, 10 * 1024 * 1024 + 1);
            fclose($stream);
            if (!preg_match('/\s200\s/', $status) || $body === false || strlen($body) > 10 * 1024 * 1024) {
                throw new RuntimeException('Instagram no entregó una respuesta pública válida');
            }
        }
        return $body;
    }

    public static function publicPosts(string $source): array
    {
        $found = [];
        $walk = null;
        $walk = static function (mixed $value, int $depth = 0) use (&$walk, &$found): void {
            if ($depth > 80) return;
            if (is_array($value)) {
                $code = $value['shortcode'] ?? null;
                $owner = $value['owner'] ?? [];
                $timestamp = $value['taken_at_timestamp'] ?? null;
                if (is_string($code) && preg_match('/^[A-Za-z0-9_-]{5,30}$/D', $code)
                    && ($owner['username'] ?? '') === self::ACCOUNT
                    && empty($owner['is_private']) && empty($owner['is_unpublished'])
                    && (is_int($timestamp) || is_float($timestamp))) {
                    $texts = [];
                    foreach ($value['edge_media_to_caption']['edges'] ?? [] as $edge) {
                        $text = $edge['node']['text'] ?? '';
                        if (is_string($text)) $texts[] = $text;
                    }
                    $caption = trim(implode("\n", $texts));
                    $image = $value['display_url'] ?? '';
                    if ($caption !== '' && is_string($image) && $image !== '') {
                        $kind = !empty($value['is_video']) ? 'reel' : 'post';
                        $route = $kind === 'reel' ? 'reel' : 'p';
                        $found[$code] = [
                            'id' => $code, 'account' => self::ACCOUNT, 'kind' => $kind,
                            'source_url' => 'https://www.instagram.com/'.self::ACCOUNT.'/'.$route.'/'.$code.'/',
                            'caption' => $caption, 'published_at' => gmdate('c', (int)$timestamp),
                            '_image_url' => $image,
                        ];
                    }
                }
                foreach ($value as $child) $walk($child, $depth + 1);
            } elseif (is_string($value) && ($value[0] ?? '') !== '' && in_array($value[0], ['{', '['], true)) {
                try { $walk(json_decode($value, true, 128, JSON_THROW_ON_ERROR), $depth + 1); }
                catch (JsonException) { /* Not a nested JSON data string. */ }
            }
        };
        preg_match_all('/\.handle\(\s*(?=\{)/', $source, $matches, PREG_OFFSET_CAPTURE);
        foreach ($matches[0] as [$marker, $offset]) {
            $start = $offset + strlen($marker);
            $level = 0; $quoted = false; $escaped = false;
            for ($i = $start, $length = strlen($source); $i < $length; $i++) {
                $char = $source[$i];
                if ($quoted) {
                    if ($escaped) $escaped = false;
                    elseif ($char === '\\') $escaped = true;
                    elseif ($char === '"') $quoted = false;
                } elseif ($char === '"') $quoted = true;
                elseif ($char === '{') $level++;
                elseif ($char === '}' && --$level === 0) {
                    try { $walk(json_decode(substr($source, $start, $i - $start + 1), true, 128, JSON_THROW_ON_ERROR)); }
                    catch (JsonException) { /* Ignore non-data script fragments. */ }
                    break;
                }
            }
        }
        $posts = array_values($found);
        usort($posts, static fn(array $a, array $b): int => strcmp($b['published_at'], $a['published_at']));
        return $posts;
    }

    public static function run(string $mode, string $output, string $imageDir, string $imagePrefix): array
    {
        if (!in_array($mode, ['new', 'today', 'latest', 'previous'], true)) throw new InvalidArgumentException('Modo no válido');
        if (!is_dir(dirname($output)) && !mkdir(dirname($output), 0755, true) && !is_dir(dirname($output))) {
            throw new RuntimeException('No se pudo preparar la carpeta de novedades');
        }
        $output = realpath(dirname($output)).'/'.basename($output);
        $lock = fopen(sys_get_temp_dir().'/ar-instagram-'.hash('sha256', $output).'.lock', 'c');
        if ($lock === false || !flock($lock, LOCK_EX)) throw new RuntimeException('No se pudo bloquear la sincronización');
        try {
            $existing = is_file($output) ? json_decode((string)file_get_contents($output), true, 128, JSON_THROW_ON_ERROR) : ['posts' => []];
            $posts = self::publicPosts(self::fetch(self::SOURCE));
            if (!$posts) throw new RuntimeException('Instagram no entregó publicaciones públicas verificables');
            $now = gmdate('c');
            $saved = [];
            foreach ($existing['posts'] ?? [] as $post) $saved[$post['id']] = $post;
            if ($mode === 'previous') {
                if (count($posts) < 2) throw new RuntimeException('No se encontró la publicación anterior');
                $selected = [$posts[1]];
            } elseif ($mode === 'latest' || ($mode === 'new' && !$saved)) $selected = [$posts[0]];
            elseif ($mode === 'today') {
                $today = (new DateTimeImmutable('now', new DateTimeZone('America/Argentina/Cordoba')))->format('Y-m-d');
                $selected = array_values(array_filter($posts, static fn(array $p): bool =>
                    (new DateTimeImmutable($p['published_at']))->setTimezone(new DateTimeZone('America/Argentina/Cordoba'))->format('Y-m-d') === $today));
            } else {
                $newest = max(array_map(static fn(array $p): int => (int)strtotime($p['published_at']), $saved));
                $selected = array_values(array_filter($posts, static fn(array $p): bool =>
                    !isset($saved[$p['id']]) && strtotime($p['published_at']) >= $newest));
            }
            $imported = [];
            foreach ($selected as $post) {
                $bytes = self::fetch($post['_image_url'], true);
                unset($post['_image_url']);
                if (str_starts_with($bytes, "\xff\xd8\xff")) $ext = '.jpg';
                elseif (str_starts_with($bytes, "\x89PNG\r\n\x1a\n")) $ext = '.png';
                elseif (str_starts_with($bytes, 'RIFF') && substr($bytes, 8, 4) === 'WEBP') $ext = '.webp';
                else throw new RuntimeException('La descarga no es una imagen válida');
                if (!is_dir($imageDir) && !mkdir($imageDir, 0755, true) && !is_dir($imageDir)) throw new RuntimeException('No se pudo preparar la carpeta de imágenes');
                $filename = $post['id'].$ext;
                $target = rtrim($imageDir, '/').'/'.$filename;
                $temp = $target.'.'.getmypid().'.tmp';
                if (file_put_contents($temp, $bytes, LOCK_EX) === false || !rename($temp, $target)) throw new RuntimeException('No se pudo guardar la imagen');
                $post['image'] = rtrim($imagePrefix, '/').'/'.$filename;
                $post['imported_at'] = $saved[$post['id']]['imported_at'] ?? $now;
                $saved[$post['id']] = $post;
                $imported[] = $post['id'];
            }
            $all = array_values($saved);
            usort($all, static fn(array $a, array $b): int => strcmp($b['published_at'], $a['published_at']));
            $result = array_replace($existing, ['account' => self::ACCOUNT, 'source' => self::SOURCE, 'checked_at' => $now, 'mode' => $mode, 'posts' => $all]);
            $temp = $output.'.'.getmypid().'.tmp';
            if (file_put_contents($temp, json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR)."\n", LOCK_EX) === false || !rename($temp, $output)) throw new RuntimeException('No se pudieron guardar las novedades');
            return ['mode' => $mode, 'read_public_posts' => count($posts), 'imported' => $imported, 'total' => count($all)];
        } finally {
            flock($lock, LOCK_UN);
            fclose($lock);
        }
    }
}

if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    if (PHP_SAPI !== 'cli') { http_response_code(403); exit; }
    try {
        $options = getopt('', ['mode:', 'output:', 'image-dir:', 'image-url-prefix:']);
        $root = dirname(__DIR__);
        $result = ARInstagramSync::run($options['mode'] ?? 'new', $options['output'] ?? $root.'/a-remarla/data/instagram.json', $options['image-dir'] ?? $root.'/assets/a-remarla-instagram', $options['image-url-prefix'] ?? '../assets/a-remarla-instagram/');
        echo json_encode($result, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR)."\n";
    } catch (Throwable $error) {
        fwrite(STDERR, 'No se actualizó el carrusel; se conserva la última lectura: '.$error->getMessage()."\n");
        exit(1);
    }
}
