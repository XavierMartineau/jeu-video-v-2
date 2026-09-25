extends CharacterBody2D

signal died
signal health_changed(value)
signal projectile_requested(origin, direction)

const SPEED := 280.0
const JUMP_VELOCITY := -590.0
var spawn_position := Vector2.ZERO
var invulnerable := false
var animated_sprite: AnimatedSprite2D
var health := 100
var shoot_cooldown := 0.0

func _ready() -> void:
    spawn_position = global_position
    create_wraith_animations()

func _physics_process(delta: float) -> void:
    shoot_cooldown = maxf(shoot_cooldown - delta, 0.0)
    if not is_on_floor():
        velocity += get_gravity() * delta
    if Input.is_action_just_pressed("jump") and is_on_floor():
        velocity.y = JUMP_VELOCITY
    if Input.is_action_just_pressed("shoot") and shoot_cooldown <= 0.0:
        shoot_cooldown = 0.35
        var shoot_direction := -1.0 if animated_sprite.flip_h else 1.0
        projectile_requested.emit(global_position + Vector2(28.0 * shoot_direction, -12.0), shoot_direction)
    var direction := Input.get_axis("move_left", "move_right")
    if direction:
        velocity.x = move_toward(velocity.x, direction * SPEED, 42.0)
        animated_sprite.flip_h = direction < 0.0
    else:
        velocity.x = move_toward(velocity.x, 0.0, 36.0)
    move_and_slide()
    if global_position.y > 900.0:
        take_damage()
    if is_on_floor() and abs(velocity.x) > 20.0:
        animated_sprite.play("walk")
    elif is_on_floor():
        animated_sprite.play("idle")
    else:
        animated_sprite.play("walk")

func take_damage(amount := 100) -> void:
    if invulnerable:
        return
    invulnerable = true
    health = maxi(health - amount, 0)
    health_changed.emit(health)
    animated_sprite.play("hurt")
    if health <= 0:
        animated_sprite.play("die")
        died.emit()
    await get_tree().create_timer(1.0).timeout
    invulnerable = false

func reset_to_spawn() -> void:
    global_position = spawn_position
    velocity = Vector2.ZERO
    health = 100
    health_changed.emit(health)

func create_wraith_animations() -> void:
    var frames := SpriteFrames.new()
    frames.remove_animation("default")
    add_animation_from_folder(frames, "idle", "Idle", "Wraith_03_Idle_", 12, 0.12)
    add_animation_from_folder(frames, "walk", "Walking", "Wraith_03_Moving Forward_", 12, 0.08)
    add_animation_from_folder(frames, "hurt", "Hurt", "Wraith_03_Hurt_", 12, 0.1)
    add_animation_from_folder(frames, "die", "Dying", "Wraith_03_Dying_", 15, 0.1)
    animated_sprite = AnimatedSprite2D.new()
    animated_sprite.sprite_frames = frames
    animated_sprite.animation = "idle"
    animated_sprite.scale = Vector2(0.62, 0.62)
    add_child(animated_sprite)
    animated_sprite.play("idle")

func add_animation_from_folder(frames: SpriteFrames, animation_name: String, folder_name: String, file_prefix: String, frame_count: int, speed: float) -> void:
    frames.add_animation(animation_name)
    frames.set_animation_speed(animation_name, 1.0 / speed)
    frames.set_animation_loop(animation_name, animation_name != "die")
    for frame_index in range(frame_count):
        var padded_index := "%03d" % frame_index
        var file_path := "res://assets/spritesheets/character/Wraith_03/PNG Sequences/%s/%s%s.png" % [folder_name, file_prefix, padded_index]
        var texture := load(file_path) as Texture2D
        if texture:
            frames.add_frame(animation_name, texture)
