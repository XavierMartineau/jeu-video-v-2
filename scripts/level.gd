@tool
extends Node2D

signal level_completed
signal player_died

@export var level_number := 1
var game: Node
var player: CharacterBody2D
var required_coins := 0
var collected_here := 0
var exit_unlocked := false
var exit_area: Area2D
var lock_label: Label

func _ready() -> void:
    queue_redraw()
    build_level()

func build_level() -> void:
    var data := get_level_data()
    required_coins = data.coins.size()
    for platform in data.platforms:
        create_platform(platform[0], platform[1])
    for coin_position in data.coins:
        create_coin(coin_position)
    for moving in data.moving:
        create_moving_platform(moving[0], moving[1])
    for lever_position in data.levers:
        create_lever(lever_position)
    for enemy_position in data.enemies:
        create_enemy(enemy_position, false)
    if data.boss != Vector2.ZERO:
        create_enemy(data.boss, true)
    create_exit(data.exit)
    create_player(data.spawn)

func add_generated_child(node: Node) -> void:
    add_child(node)
    if Engine.is_editor_hint():
        node.owner = self

func create_player(spawn: Vector2) -> void:
    player = CharacterBody2D.new()
    player.set_script(load("res://scripts/player.gd"))
    player.position = spawn
    var shape := CollisionShape2D.new()
    var rectangle := RectangleShape2D.new()
    rectangle.size = Vector2(30, 58)
    shape.shape = rectangle
    player.add_child(shape)
    player.died.connect(player_died)
    player.connect("projectile_requested", Callable(self, "spawn_projectile"))
    if game:
        player.connect("health_changed", Callable(game.hud, "update_health"))
        game.hud.update_health(100)
    add_generated_child(player)
    var camera := Camera2D.new()
    camera.position_smoothing_enabled = true
    camera.position_smoothing_speed = 7.0
    camera.limit_left = 0
    camera.limit_right = 2600
    camera.limit_top = 0
    camera.limit_bottom = 720
    player.add_child(camera)

func spawn_projectile(origin: Vector2, direction: float) -> void:
    var projectile := Area2D.new()
    projectile.set_script(load("res://scripts/projectile.gd"))
    projectile.global_position = origin
    projectile.direction = direction
    var shape := CollisionShape2D.new()
    var circle := CircleShape2D.new()
    circle.radius = 9.0
    shape.shape = circle
    projectile.add_child(shape)
    add_child(projectile)

func create_platform(rect: Rect2, color: Color, _solid := true) -> void:
    var body := StaticBody2D.new()
    body.position = rect.position + rect.size / 2.0
    var shape := CollisionShape2D.new()
    var box := RectangleShape2D.new()
    box.size = rect.size
    shape.shape = box
    body.add_child(shape)
    var visual := Polygon2D.new()
    visual.polygon = PackedVector2Array([Vector2(-rect.size.x / 2, -rect.size.y / 2), Vector2(rect.size.x / 2, -rect.size.y / 2), Vector2(rect.size.x / 2, rect.size.y / 2), Vector2(-rect.size.x / 2, rect.size.y / 2)])
    visual.color = color
    body.add_child(visual)
    add_generated_child(body)

func create_coin(position_value: Vector2) -> void:
    var coin := Area2D.new()
    coin.set_script(load("res://scripts/collectible.gd"))
    coin.position = position_value
    var shape := CollisionShape2D.new()
    var circle := CircleShape2D.new()
    circle.radius = 14.0
    shape.shape = circle
    coin.add_child(shape)
    add_generated_child(coin)

func create_moving_platform(position_value: Vector2, travel: Vector2) -> void:
    var platform := AnimatableBody2D.new()
    platform.set_script(load("res://scripts/moving_platform.gd"))
    platform.position = position_value
    platform.travel = travel
    var shape := CollisionShape2D.new()
    var box := RectangleShape2D.new()
    box.size = Vector2(150, 20)
    shape.shape = box
    platform.add_child(shape)
    add_generated_child(platform)

func create_lever(position_value: Vector2) -> void:
    var lever := Area2D.new()
    lever.set_script(load("res://scripts/lever.gd"))
    lever.position = position_value
    var shape := CollisionShape2D.new()
    var circle := CircleShape2D.new()
    circle.radius = 42.0
    shape.shape = circle
    lever.add_child(shape)
    lever.pulled.connect(_on_lever_pulled)
    add_generated_child(lever)

func create_enemy(position_value: Vector2, is_boss: bool) -> void:
    var enemy := CharacterBody2D.new()
    enemy.set_script(load("res://scripts/enemy.gd"))
    enemy.boss = is_boss
    enemy.position = position_value
    var shape := CollisionShape2D.new()
    var box := RectangleShape2D.new()
    box.size = Vector2(65 if is_boss else 45, 75 if is_boss else 48)
    shape.shape = box
    enemy.add_child(shape)
    add_generated_child(enemy)

func create_exit(position_value: Vector2) -> void:
    exit_area = Area2D.new()
    exit_area.position = position_value
    var shape := CollisionShape2D.new()
    var box := RectangleShape2D.new()
    box.size = Vector2(54, 90)
    shape.shape = box
    exit_area.add_child(shape)
    exit_area.body_entered.connect(_on_exit_entered)
    add_generated_child(exit_area)
    lock_label = Label.new()
    lock_label.text = "VERROUILLE\n%d CRISTAUX" % required_coins
    lock_label.position = position_value + Vector2(-62, -76)
    lock_label.add_theme_color_override("font_color", Color("#f4c95d"))
    lock_label.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
    lock_label.size = Vector2(125, 55)
    add_generated_child(lock_label)

func _on_lever_pulled() -> void:
    exit_unlocked = true
    lock_label.text = "SORTIE\nOUVERTE"
    lock_label.add_theme_color_override("font_color", Color("#b8f2e6"))

func _on_exit_entered(body: Node) -> void:
    if body != player:
        return
    if collected_here >= required_coins or exit_unlocked:
        level_completed.emit()
    else:
        lock_label.text = "RAMASSE LES\nCRISTAUX"

func _process(_delta: float) -> void:
    if game and player:
        collected_here = game.collected_coins - (0 if level_number == 1 else get_previous_coin_count())
        if collected_here >= required_coins and not exit_unlocked:
            exit_unlocked = true
            lock_label.text = "SORTIE\nOUVERTE"
    queue_redraw()

func get_previous_coin_count() -> int:
    if level_number == 1:
        return 0
    if level_number == 2:
        return 4
    if level_number == 3:
        return 9
    return 15

func reset_player() -> void:
    player.reset_to_spawn()

func get_level_data() -> Dictionary:
    if level_number == 1:
        return {"spawn": Vector2(140, 500), "exit": Vector2(2350, 530), "platforms": [ [Rect2(0, 620, 2600, 100), Color("#263b44")], [Rect2(0, 520, 310, 28), Color("#4aa3a2")], [Rect2(410, 470, 260, 28), Color("#4aa3a2")], [Rect2(780, 380, 260, 28), Color("#4aa3a2")], [Rect2(1150, 500, 260, 28), Color("#4aa3a2")], [Rect2(1510, 410, 260, 28), Color("#4aa3a2")], [Rect2(1900, 520, 430, 28), Color("#4aa3a2")] ], "coins": [Vector2(180, 470), Vector2(500, 420), Vector2(850, 330), Vector2(1220, 450)], "moving": [[Vector2(690, 500), Vector2(0, -150)], [Vector2(1780, 500), Vector2(0, -100)]], "levers": [Vector2(1450, 460)], "enemies": [Vector2(580, 410)], "boss": Vector2.ZERO}
    if level_number == 2:
        return {"spawn": Vector2(140, 500), "exit": Vector2(2400, 530), "platforms": [ [Rect2(0, 620, 2600, 100), Color("#303b52")], [Rect2(0, 520, 300, 28), Color("#6980a8")], [Rect2(470, 450, 250, 28), Color("#6980a8")], [Rect2(900, 350, 260, 28), Color("#6980a8")], [Rect2(1310, 470, 250, 28), Color("#6980a8")], [Rect2(1700, 360, 280, 28), Color("#6980a8")], [Rect2(2070, 520, 350, 28), Color("#6980a8")] ], "coins": [Vector2(150, 470), Vector2(530, 400), Vector2(960, 300), Vector2(1370, 420), Vector2(1800, 310)], "moving": [[Vector2(760, 480), Vector2(0, -170)], [Vector2(1590, 550), Vector2(0, -180)]], "levers": [Vector2(1240, 430), Vector2(2000, 480)], "enemies": [Vector2(590, 400), Vector2(1450, 420)], "boss": Vector2.ZERO}
    if level_number == 4:
        return {"spawn": Vector2(150, 500), "exit": Vector2(2380, 530), "platforms": [ [Rect2(0, 620, 2600, 100), Color("#241d32")], [Rect2(0, 520, 350, 28), Color("#8c465d")], [Rect2(480, 450, 260, 28), Color("#8c465d")], [Rect2(820, 540, 300, 28), Color("#8c465d")], [Rect2(1200, 390, 260, 28), Color("#8c465d")], [Rect2(1510, 500, 260, 28), Color("#8c465d")], [Rect2(1800, 400, 300, 28), Color("#8c465d")], [Rect2(2150, 520, 330, 28), Color("#8c465d")] ], "coins": [Vector2(180, 470), Vector2(550, 410), Vector2(900, 500), Vector2(1280, 350)], "moving": [[Vector2(760, 500), Vector2(0, -190)], [Vector2(1480, 570), Vector2(0, -170)]], "levers": [Vector2(1120, 570), Vector2(2100, 450)], "enemies": [Vector2(620, 400), Vector2(1600, 450)], "boss": Vector2(1940, 325)}
    return {"spawn": Vector2(140, 500), "exit": Vector2(2400, 530), "platforms": [ [Rect2(0, 620, 2600, 100), Color("#4b354d")], [Rect2(0, 520, 330, 28), Color("#b15b5b")], [Rect2(510, 430, 230, 28), Color("#b15b5b")], [Rect2(900, 520, 260, 28), Color("#b15b5b")], [Rect2(1350, 390, 280, 28), Color("#b15b5b")], [Rect2(1800, 460, 250, 28), Color("#b15b5b")], [Rect2(2150, 520, 320, 28), Color("#b15b5b")] ], "coins": [Vector2(170, 470), Vector2(570, 380), Vector2(960, 470), Vector2(1420, 340), Vector2(1870, 410), Vector2(2220, 470)], "moving": [[Vector2(780, 500), Vector2(0, -170)], [Vector2(1670, 520), Vector2(0, -150)]], "levers": [Vector2(1170, 570)], "enemies": [Vector2(630, 380)], "boss": Vector2(1980, 390)}

func _draw() -> void:
    var skies: Array[Color] = [Color("#183542"), Color("#252f4a"), Color("#3d2944"), Color("#241d32")]
    var sky: Color = skies[level_number - 1]
    draw_rect(Rect2(0, 0, 2600, 720), sky)
    for index in 10:
        var x := float(index * 280 + 80)
        draw_circle(Vector2(x, 125 + (index % 3) * 55), 2.5, Color("#b8f2e6"))
    draw_string(ThemeDB.fallback_font, Vector2(72, 110), ["LA VALLEE DES ECHOS", "LES MINES SUSPENDUES", "LE COEUR DU GEANT", "ARENE DU WRAITH" ][level_number - 1], HORIZONTAL_ALIGNMENT_LEFT, -1, 28, Color("#ffffff80"))
